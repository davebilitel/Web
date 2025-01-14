const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const { Readable } = require('stream');
const fs = require('fs').promises;
const path = require('path');

async function generateSitemap(app) {
    try {
        const sitemap = new SitemapStream({ hostname: process.env.SITE_URL || 'https://virtualservicesaf.com' });
        
        // Add your routes
        const routes = [
            { url: '/', changefreq: 'daily', priority: 1 },
            { url: '/about', changefreq: 'weekly', priority: 0.8 },
            { url: '/visa', changefreq: 'daily', priority: 0.9 },
            { url: '/mastercard', changefreq: 'daily', priority: 0.9 },
            { url: '/faq', changefreq: 'weekly', priority: 0.7 },
            { url: '/contact', changefreq: 'monthly', priority: 0.6 }
        ];

        routes.forEach(route => {
            sitemap.write(route);
        });

        sitemap.end();

        const sitemapXML = await streamToPromise(Readable.from([sitemap.toString()]));
        await fs.writeFile(path.join(__dirname, '../../public/sitemap.xml'), sitemapXML);

        console.log('Sitemap generated successfully');
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }
}

module.exports = generateSitemap; 