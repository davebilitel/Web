export const prefetchRoute = async (route) => {
    try {
        // Preload route components
        switch (route) {
            case '/balance':
                await import('../components/Balance');
                await import('../components/Card3D');
                break;
            case '/top-up':
                await import('../components/TopUp');
                await import('../components/Card3D');
                break;
            default:
                break;
        }
    } catch (error) {
        console.warn('Prefetch failed:', error);
    }
}; 