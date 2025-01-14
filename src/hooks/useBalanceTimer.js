import { useState, useEffect } from 'react';

const BALANCE_CHECK_COOLDOWN = 10 * 60 * 1000; // 10 minutes in milliseconds

export function useBalanceTimer() {
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        // Check last balance check time from localStorage
        const lastCheckTime = localStorage.getItem('lastBalanceCheck');
        
        if (lastCheckTime) {
            const timePassed = Date.now() - parseInt(lastCheckTime);
            const remaining = Math.max(0, BALANCE_CHECK_COOLDOWN - timePassed);
            setTimeRemaining(remaining);

            if (remaining > 0) {
                const timer = setInterval(() => {
                    setTimeRemaining(prev => {
                        const newTime = Math.max(0, prev - 1000);
                        return newTime;
                    });
                }, 1000);

                return () => clearInterval(timer);
            }
        }
    }, []);

    const setLastCheckTime = () => {
        localStorage.setItem('lastBalanceCheck', Date.now().toString());
        setTimeRemaining(BALANCE_CHECK_COOLDOWN);
    };

    const formatTimeRemaining = () => {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return {
        isOnCooldown: timeRemaining > 0,
        timeRemaining: formatTimeRemaining(),
        setLastCheckTime
    };
} 