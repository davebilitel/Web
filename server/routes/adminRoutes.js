const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const router = express.Router();
const Order = require('../models/Order');
const ExchangeRate = require('../models/ExchangeRate');
const Report = require('../models/Report');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const BalanceRequest = require('../models/BalanceRequest');
const Card = require('../models/Card');
const nodemailer = require('nodemailer');
const TopUpOrder = require('../models/TopUpOrder');
const CardOrder = require('../models/CardOrder');
const { generate2FASecret, verify2FAToken, generateBackupCodes } = require('../utils/twoFactor');

// Admin signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const admin = new Admin({ name, email, password });
        await admin.save();

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, admin: { name: admin.name, email: admin.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (admin.twoFactorEnabled) {
            // Generate a temporary token for 2FA verification
            const tempToken = jwt.sign(
                { id: admin._id, temp: true },
                process.env.JWT_SECRET,
                { expiresIn: '5m' }
            );

            return res.json({
                requires2FA: true,
                tempToken
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add 2FA verification endpoint
router.post('/verify-2fa', async (req, res) => {
    try {
        const { token, tempToken } = req.body;

        // Verify temp token
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.temp) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ error: 'Admin not found' });
        }

        // Verify 2FA token
        const isValid = verify2FAToken(token, admin.twoFactorSecret);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        // Generate final token
        const finalToken = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token: finalToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
    try {
        // Fetch both card orders and top-up orders
        const cardOrders = await CardOrder.find().sort({ createdAt: -1 });
        const topUpOrders = await TopUpOrder.find().sort({ createdAt: -1 });

        // Combine and sort by date
        const allTransactions = [...cardOrders, ...topUpOrders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate monthly stats for combined transactions
        const monthlyStats = Array.from({ length: 6 }, (_, i) => {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
            const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

            const monthTransactions = allTransactions.filter(t => 
                new Date(t.createdAt) >= monthStart && 
                new Date(t.createdAt) <= monthEnd
            );

            return {
                month: month.toLocaleString('default', { month: 'long' }),
                successful: {
                    count: monthTransactions.filter(t => t.status === 'SUCCESSFUL').length,
                    amount: monthTransactions
                        .filter(t => t.status === 'SUCCESSFUL')
                        .reduce((sum, t) => sum + (t.amount || 0), 0)
                },
                failed: {
                    count: monthTransactions.filter(t => t.status === 'FAILED').length,
                    amount: monthTransactions
                        .filter(t => t.status === 'FAILED')
                        .reduce((sum, t) => sum + (t.amount || 0), 0)
                }
            };
        }).reverse();

        res.json({ 
            transactions: allTransactions,
            monthlyStats
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Update transaction status
router.patch('/transactions/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Try to update in both collections
        let transaction = await CardOrder.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!transaction) {
            transaction = await TopUpOrder.findByIdAndUpdate(
                req.params.id,
                { status, updatedAt: new Date() },
                { new: true }
            );
        }

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this route to get admin profile
router.get('/profile', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update admin profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const { name, phone, country, profileImage } = req.body;
        const admin = await Admin.findById(req.user.id);

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        if (name) admin.name = name;
        if (phone) admin.phone = phone;
        if (country) admin.country = country;
        if (profileImage) admin.profileImage = profileImage;

        await admin.save();
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update delete transactions endpoint
router.post('/transactions/delete', auth, async (req, res) => {
    try {
        const { transactionIds } = req.body;
        
        // Delete from both collections
        await Promise.all([
            CardOrder.deleteMany({ _id: { $in: transactionIds } }),
            TopUpOrder.deleteMany({ _id: { $in: transactionIds } })
        ]);
        
        res.json({ message: 'Transactions deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transactions' });
    }
});

// Add these new analytics endpoints
router.get('/analytics', auth, async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const now = new Date();
        let startDate;

        // Set time period
        switch (period) {
            case 'daily':
                startDate = new Date(now.setDate(now.getDate() - 30)); // Last 30 days
                break;
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 90)); // Last 90 days
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 12)); // Last 12 months
                break;
            default:
                startDate = new Date(now.setMonth(now.getMonth() - 12));
        }

        // Get all transactions within the period
        const transactions = await Order.find({
            createdAt: { $gte: startDate }
        });

        // Calculate revenue metrics
        const revenueData = {
            total: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
            byPaymentMethod: transactions.reduce((acc, t) => {
                acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + (t.amount || 0);
                return acc;
            }, {}),
            byPeriod: {}
        };

        // Calculate success rates
        const successRate = {
            total: {
                successful: transactions.filter(t => t.status === 'SUCCESSFUL').length,
                failed: transactions.filter(t => t.status === 'FAILED').length,
                pending: transactions.filter(t => t.status === 'PENDING').length,
                total: transactions.length
            },
            byPaymentMethod: transactions.reduce((acc, t) => {
                if (!acc[t.paymentMethod]) {
                    acc[t.paymentMethod] = { successful: 0, failed: 0, pending: 0, total: 0 };
                }
                acc[t.paymentMethod][t.status.toLowerCase()]++;
                acc[t.paymentMethod].total++;
                return acc;
            }, {})
        };

        // Calculate period-specific metrics
        if (period === 'daily') {
            // Group by day
            transactions.forEach(t => {
                const date = t.createdAt.toISOString().split('T')[0];
                if (!revenueData.byPeriod[date]) {
                    revenueData.byPeriod[date] = 0;
                }
                revenueData.byPeriod[date] += t.amount || 0;
            });
        } else if (period === 'weekly') {
            // Group by week
            transactions.forEach(t => {
                const week = getWeekNumber(t.createdAt);
                if (!revenueData.byPeriod[week]) {
                    revenueData.byPeriod[week] = 0;
                }
                revenueData.byPeriod[week] += t.amount || 0;
            });
        } else {
            // Group by month
            transactions.forEach(t => {
                const month = t.createdAt.toISOString().slice(0, 7);
                if (!revenueData.byPeriod[month]) {
                    revenueData.byPeriod[month] = 0;
                }
                revenueData.byPeriod[month] += t.amount || 0;
            });
        }

        // Add country-based metrics
        const countryMetrics = {
            CM: {
                total: transactions.filter(t => t.country === 'CM').length,
                successful: transactions.filter(t => t.country === 'CM' && t.status === 'SUCCESSFUL').length,
                amount: transactions
                    .filter(t => t.country === 'CM')
                    .reduce((sum, t) => sum + (t.amount || 0), 0)
            },
            SN: {
                total: transactions.filter(t => t.country === 'SN').length,
                successful: transactions.filter(t => t.country === 'SN' && t.status === 'SUCCESSFUL').length,
                amount: transactions
                    .filter(t => t.country === 'SN')
                    .reduce((sum, t) => sum + (t.amount || 0), 0)
            }
        };

        res.json({
            revenue: revenueData,
            successRate,
            userGrowth: {
                total: transactions.length,
                newUsers: transactions.reduce((acc, t) => {
                    acc.add(t.user.email);
                    return acc;
                }, new Set()).size
            },
            countryMetrics
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Add export endpoint
router.get('/export', auth, async (req, res) => {
    try {
        const { format = 'csv', startDate, endDate } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const transactions = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        if (format === 'csv') {
            const csv = generateCSV(transactions);
            res.header('Content-Type', 'text/csv');
            res.attachment('transactions.csv');
            return res.send(csv);
        } else if (format === 'excel') {
            const excel = generateExcel(transactions);
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment('transactions.xlsx');
            return res.send(excel);
        }

        res.status(400).json({ error: 'Invalid format specified' });
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Helper function for week numbers
function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
}

// Add these new analytics endpoints
router.get('/advanced-analytics', auth, async (req, res) => {
    try {
        const { startDate, endDate, timeFrame = 'daily' } = req.query;
        
        // Base query
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const transactions = await Order.find(query);

        // Real-time metrics
        const realtimeMetrics = {
            last24Hours: transactions.filter(t => 
                new Date(t.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ),
            lastHour: transactions.filter(t => 
                new Date(t.createdAt) > new Date(Date.now() - 60 * 60 * 1000)
            )
        };

        // Geographic distribution
        const geoDistribution = transactions.reduce((acc, t) => {
            const country = t.user?.country || 'Unknown';
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {});

        // Time-based heat map data
        const heatMapData = transactions.reduce((acc, t) => {
            const date = new Date(t.createdAt);
            const day = date.getDay();
            const hour = date.getHours();
            
            if (!acc[day]) acc[day] = {};
            if (!acc[day][hour]) acc[day][hour] = 0;
            
            acc[day][hour]++;
            return acc;
        }, {});

        // Conversion rates
        const conversionRates = {
            overall: {
                total: transactions.length,
                successful: transactions.filter(t => t.status === 'SUCCESSFUL').length,
                rate: (transactions.filter(t => t.status === 'SUCCESSFUL').length / transactions.length) * 100
            },
            byMethod: transactions.reduce((acc, t) => {
                if (!acc[t.paymentMethod]) {
                    acc[t.paymentMethod] = { total: 0, successful: 0 };
                }
                acc[t.paymentMethod].total++;
                if (t.status === 'SUCCESSFUL') {
                    acc[t.paymentMethod].successful++;
                }
                return acc;
            }, {})
        };

        // Predictive patterns (simple trend analysis)
        const trendAnalysis = {
            dailyAverages: calculateDailyAverages(transactions),
            growthRate: calculateGrowthRate(transactions),
            predictedVolume: calculatePredictedVolume(transactions)
        };

        res.json({
            realtimeMetrics,
            geoDistribution,
            heatMapData,
            conversionRates,
            trendAnalysis
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

// Helper functions for predictive analytics
function calculateDailyAverages(transactions) {
    // Group by date and calculate averages
    const dailyGroups = transactions.reduce((acc, t) => {
        const date = new Date(t.createdAt).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { count: 0, amount: 0 };
        acc[date].count++;
        acc[date].amount += t.amount || 0;
        return acc;
    }, {});

    return Object.values(dailyGroups).reduce((acc, day) => {
        acc.avgCount = (acc.avgCount || 0) + day.count;
        acc.avgAmount = (acc.avgAmount || 0) + day.amount;
        return acc;
    }, {});
}

function calculateGrowthRate(transactions) {
    // Calculate week-over-week growth
    const weeklyVolumes = transactions.reduce((acc, t) => {
        const week = getWeekNumber(new Date(t.createdAt));
        if (!acc[week]) acc[week] = 0;
        acc[week]++;
        return acc;
    }, {});

    const weeks = Object.keys(weeklyVolumes).sort();
    if (weeks.length < 2) return 0;

    const lastWeek = weeklyVolumes[weeks[weeks.length - 1]];
    const previousWeek = weeklyVolumes[weeks[weeks.length - 2]];
    
    return ((lastWeek - previousWeek) / previousWeek) * 100;
}

function calculatePredictedVolume(transactions) {
    if (!transactions.length) return 0;
    
    const dailyAverages = calculateDailyAverages(transactions);
    const growthRate = calculateGrowthRate(transactions);
    
    // Simple linear projection
    return Math.round(dailyAverages.avgCount * (1 + (growthRate / 100)));
}

// Add this near your other routes
router.get('/test-analytics', auth, async (req, res) => {
    try {
        res.json({
            message: 'Analytics endpoint is working',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: 'Test endpoint failed' });
    }
});

// Get all exchange rates
router.get('/exchange-rates', auth, async (req, res) => {
    try {
        const rates = await ExchangeRate.find().sort('-updatedAt');
        res.json(rates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update exchange rate
router.put('/exchange-rates/:country', auth, async (req, res) => {
    try {
        const { rateToUSD } = req.body;
        const { country } = req.params;

        if (!rateToUSD || rateToUSD <= 0) {
            return res.status(400).json({ error: 'Invalid exchange rate' });
        }

        const currency = getCurrencyForCountry(country);

        const rate = await ExchangeRate.findOneAndUpdate(
            { country },
            { 
                country,
                currency,
                rateToUSD,
                updatedBy: req.user._id
            },
            { new: true, upsert: true }
        );

        res.json(rate);
    } catch (error) {
        console.error('Exchange rate update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to get currency code
function getCurrencyForCountry(country) {
    switch (country) {
        case 'CM':
            return 'XAF';
        case 'RW':
            return 'RWF';
        case 'UG':
            return 'UGX';
        case 'KE':
            return 'KES';
        case 'SN':
        case 'BF':
        case 'CI':
            return 'XOF';
        default:
            return 'XAF';
    }
}

// Generate and schedule reports
router.post('/reports/schedule', auth, async (req, res) => {
    try {
        const { frequency, reportType, filters } = req.body;
        const report = new Report({
            frequency,
            reportType,
            filters,
            createdBy: req.user._id
        });
        await report.save();
        
        // Schedule the report generation based on frequency
        scheduleReport(report);
        
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate custom report
router.post('/reports/custom', auth, async (req, res) => {
    try {
        const { startDate, endDate, metrics, format } = req.body;
        
        // Fetch data based on parameters
        const transactions = await Order.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });
        
        // Generate report based on format
        if (format === 'excel') {
            const buffer = await generateExcelReport(transactions, metrics);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
            return res.send(buffer);
        } else if (format === 'pdf') {
            const buffer = await generatePDFReport(transactions, metrics);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
            return res.send(buffer);
        }
        
        res.json({ transactions, metrics });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to generate Excel report
async function generateExcelReport(data, metrics) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    // Add headers
    worksheet.columns = metrics.map(metric => ({
        header: metric.label,
        key: metric.key,
        width: 15
    }));
    
    // Add data
    worksheet.addRows(data);
    
    return await workbook.xlsx.writeBuffer();
}

// Helper function to generate PDF report
async function generatePDFReport(data, metrics) {
    const doc = new PDFDocument();
    const buffers = [];
    
    doc.on('data', buffer => buffers.push(buffer));
    doc.on('end', () => Buffer.concat(buffers));
    
    // Add report content
    doc.fontSize(16).text('Transaction Report', { align: 'center' });
    doc.moveDown();
    
    // Add data in tabular format
    data.forEach(item => {
        metrics.forEach(metric => {
            doc.text(`${metric.label}: ${item[metric.key]}`);
        });
        doc.moveDown();
    });
    
    doc.end();
    
    return Buffer.concat(buffers);
}

// Add this function after your route handlers
function scheduleReport(report) {
    let schedulePattern;
    
    switch (report.frequency) {
        case 'daily':
            schedulePattern = '0 0 * * *'; // Run at midnight every day
            break;
        case 'weekly':
            schedulePattern = '0 0 * * 0'; // Run at midnight every Sunday
            break;
        case 'monthly':
            schedulePattern = '0 0 1 * *'; // Run at midnight on the first of each month
            break;
        default:
            throw new Error('Invalid frequency');
    }

    schedule.scheduleJob(schedulePattern, async () => {
        try {
            // Generate the report based on type
            const data = await fetchReportData(report.reportType, report.filters);
            
            // Generate both formats
            const excelBuffer = await generateExcelReport(data, getMetricsForType(report.reportType));
            const pdfBuffer = await generatePDFReport(data, getMetricsForType(report.reportType));
            
            // Save or email the reports
            // TODO: Implement report storage or email sending
            
            // Update last generated timestamp
            await Report.findByIdAndUpdate(report._id, {
                lastGenerated: new Date()
            });
        } catch (error) {
            console.error('Scheduled report generation failed:', error);
        }
    });
}

function getMetricsForType(reportType) {
    switch (reportType) {
        case 'transactions':
            return [
                { key: 'transactionId', label: 'Transaction ID' },
                { key: 'amount', label: 'Amount' },
                { key: 'status', label: 'Status' },
                { key: 'paymentMethod', label: 'Payment Method' },
                { key: 'createdAt', label: 'Date' }
            ];
        case 'revenue':
            return [
                { key: 'date', label: 'Date' },
                { key: 'revenue', label: 'Revenue' },
                { key: 'transactions', label: 'Transactions' }
            ];
        // Add more report types as needed
        default:
            return [];
    }
}

async function fetchReportData(reportType, filters) {
    switch (reportType) {
        case 'transactions':
            return await Order.find(filters).sort('-createdAt');
        case 'revenue':
            return await Order.aggregate([
                { $match: { status: 'SUCCESSFUL', ...filters } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        revenue: { $sum: '$amount' },
                        transactions: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } }
            ]);
        default:
            return [];
    }
}

// Add these routes to handle balance requests
router.get('/balance-requests', auth, async (req, res) => {
    try {
        const requests = await BalanceRequest.find({ status: 'PENDING' })
            .sort('-requestedAt')
            .limit(50);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch balance requests' });
    }
});

router.post('/balance-requests/:requestId/complete', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { balance } = req.body;

        const request = await BalanceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Update the card's balance
        const card = await Card.findOne({ cardId: request.cardId });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        card.balance = balance;
        await card.save();

        // Update the request status
        request.status = 'COMPLETED';
        request.completedAt = new Date();
        request.balance = balance;
        await request.save();

        // Send email notification
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: request.customerEmail,
            subject: 'Card Balance Check Result',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                    <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <img src="https://your-logo-url.com/logo.png" alt="Logo" style="height: 40px;">
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px; text-align: center;">
                                Balance Check Result
                            </h2>
                            <p style="color: #475569; font-size: 16px; margin-bottom: 24px; text-align: center;">
                                Here are your card details:
                            </p>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Card Number</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-size: 14px; text-align: right; font-family: monospace;">
                                        ${request.cardNumber}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Balance</td>
                                    <td style="padding: 12px 0; color: #16a34a; font-size: 18px; text-align: right; font-weight: bold;">
                                        $${Number(balance).toFixed(2)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; color: #64748b; font-size: 14px;">Date</td>
                                    <td style="padding: 12px 0; color: #0f172a; font-size: 14px; text-align: right;">
                                        ${new Date().toLocaleString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">
                                Need help? Contact our support team
                            </p>
                            <a href="mailto:support@example.com" 
                               style="color: #2563eb; text-decoration: none; font-size: 14px;">
                                support@example.com
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="color: #94a3b8; font-size: 12px;">
                            This is an automated message, please do not reply.
                        </p>
                        <p style="color: #94a3b8; font-size: 12px;">
                            &copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            message: 'Balance request completed successfully',
            emailSent: true
        });
    } catch (error) {
        console.error('Error completing balance request:', error);
        res.status(500).json({ 
            error: 'Failed to complete balance request',
            details: error.message
        });
    }
});

// Add this with your other balance request routes
router.delete('/balance-requests/:requestId', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await BalanceRequest.findByIdAndDelete(requestId);
        
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

// Add this route to get top-up transactions
router.get('/top-up-transactions', auth, async (req, res) => {
    try {
        // First update any stale pending transactions
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        await TopUpOrder.updateMany(
            {
                status: 'PENDING',
                createdAt: { $lt: fiveMinutesAgo }
            },
            {
                $set: { 
                    status: 'FAILED',
                    payment_details: {
                        failureReason: 'Transaction timeout after 5 minutes',
                        failedAt: new Date().toISOString()
                    }
                }
            }
        );

        // Get transactions
        const transactions = await TopUpOrder.find()
            .sort({ createdAt: -1 })
            .lean();

        // Calculate summary statistics
        const summary = await TopUpOrder.aggregate([
            {
                $group: {
                    _id: {
                        status: '$status',
                        country: '$country',
                        currency: '$currency'
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalAmountUSD: { $sum: '$amountUSD' }
                }
            },
            {
                $group: {
                    _id: '$_id.status',
                    countries: {
                        $push: {
                            country: '$_id.country',
                            currency: '$_id.currency',
                            count: '$count',
                            totalAmount: '$totalAmount',
                            totalAmountUSD: '$totalAmountUSD'
                        }
                    },
                    totalCount: { $sum: '$count' },
                    totalAmount: { $sum: '$totalAmount' },
                    totalAmountUSD: { $sum: '$totalAmountUSD' }
                }
            }
        ]);

        // Map the transactions
        const mappedTransactions = transactions.map(transaction => {
            if (transaction.status === 'PENDING' && 
                new Date(transaction.createdAt) < fiveMinutesAgo) {
                return {
                    ...transaction,
                    status: 'FAILED'
                };
            }

            if (transaction.paymentMethod === 'FLUTTERWAVE' && transaction.payment_details) {
                const paymentDetails = transaction.payment_details instanceof Map 
                    ? Object.fromEntries(transaction.payment_details)
                    : transaction.payment_details;

                return {
                    ...transaction,
                    flw_ref: paymentDetails.flw_ref,
                    transaction_id: paymentDetails.transaction_id,
                    reference: paymentDetails.flw_ref
                };
            }
            return transaction;
        });

        res.json({
            transactions: mappedTransactions,
            summary: summary
        });
    } catch (error) {
        console.error('Error fetching top-up transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Add route to update transaction status
router.patch('/top-up-transactions/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await TopUpOrder.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        res.json(transaction);
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update the card purchases endpoint
router.get('/card-purchases', auth, async (req, res) => {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const purchases = await CardOrder.aggregate([
            {
                $match: {
                    status: 'SUCCESSFUL',
                    createdAt: { $gte: oneDayAgo },
                    processed: { $ne: true }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    purchaseId: '$_id',
                    cardType: 1,
                    customerName: 1,
                    customerEmail: 1,
                    amount: 1,
                    currency: 1,
                    createdAt: 1,
                    paymentMethod: 1
                }
            },
            {
                $limit: 10
            }
        ]);

        // Format the response
        const formattedPurchases = purchases.map(purchase => ({
            ...purchase,
            purchaseId: purchase.purchaseId.toString(),
            timeAgo: getTimeAgo(purchase.createdAt)
        }));

        res.json(formattedPurchases);
    } catch (error) {
        console.error('Error fetching card purchases:', error);
        res.status(500).json({ error: 'Failed to fetch card purchases' });
    }
});

// Helper function to format time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'just now';
}

// Add this endpoint to mark a purchase as processed
router.post('/card-purchases/:purchaseId/process', auth, async (req, res) => {
    try {
        const purchase = await CardOrder.findOneAndUpdate(
            { _id: req.params.purchaseId },
            { processed: true },
            { new: true }
        );

        if (!purchase) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        res.json({ message: 'Purchase marked as processed' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid purchase ID format' });
        }
        console.error('Error processing purchase:', error);
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});

// Add this new endpoint to undo a processed purchase
router.post('/card-purchases/:purchaseId/undo', auth, async (req, res) => {
    try {
        const purchase = await CardOrder.findOneAndUpdate(
            { _id: req.params.purchaseId },
            { processed: false },
            { new: true }
        );

        if (!purchase) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        // Return the full purchase details needed for the stream
        const formattedPurchase = {
            purchaseId: purchase._id.toString(),
            cardType: purchase.cardType,
            customerName: purchase.customerName,
            customerEmail: purchase.customerEmail,
            amount: purchase.amount,
            currency: purchase.currency,
            paymentMethod: purchase.paymentMethod,
            createdAt: purchase.createdAt,
            timeAgo: getTimeAgo(purchase.createdAt)
        };

        res.json({ message: 'Purchase restored', purchase: formattedPurchase });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid purchase ID format' });
        }
        console.error('Error undoing purchase:', error);
        res.status(500).json({ error: 'Failed to undo purchase' });
    }
});

// Setup 2FA
router.post('/2fa/setup', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        const { secret, qrCode } = await generate2FASecret(admin.email);
        
        admin.twoFactorSecret = secret;
        await admin.save();

        res.json({ secret, qrCode });
    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({ error: 'Failed to setup 2FA' });
    }
});

// Verify and enable 2FA
router.post('/2fa/verify', auth, async (req, res) => {
    try {
        const { token, secret } = req.body;
        const isValid = verify2FAToken(token, secret);

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        const admin = await Admin.findById(req.user.id);
        admin.twoFactorEnabled = true;
        admin.backupCodes = generateBackupCodes();
        await admin.save();

        res.json({ 
            success: true, 
            backupCodes: admin.backupCodes 
        });
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ error: 'Failed to verify 2FA' });
    }
});

// Disable 2FA
router.post('/2fa/disable', auth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        admin.twoFactorEnabled = false;
        admin.twoFactorSecret = null;
        admin.backupCodes = [];
        await admin.save();

        res.json({ success: true });
    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({ error: 'Failed to disable 2FA' });
    }
});

module.exports = router; 