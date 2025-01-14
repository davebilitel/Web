import React from 'react';
import { Helmet } from 'react-helmet-async';
import { seoConfig } from '../config/seo';

function SEO({ title, description, image, type = 'website', path = '' }) {
    const {
        siteUrl = 'https://virtualservicesaf.com',
        siteName = 'Virtual Services',
        siteTitle: defaultTitle = 'Virtual Services - Secure Virtual Cards',
        siteDescription: defaultDescription = 'Get instant access to secure virtual cards for online payments.',
        twitterHandle = '@virtualservices',
        fbAppId
    } = seoConfig || {};

    const fullUrl = `${siteUrl}${path}`;
    const defaultImage = `${siteUrl}/og-image.jpg`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title ? `${title} | ${siteName}` : defaultTitle}</title>
            <meta name="description" content={description || defaultDescription} />

            {/* OpenGraph Tags */}
            <meta property="og:url" content={fullUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title || defaultTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:site_name" content={siteName} />
            {fbAppId && <meta property="fb:app_id" content={fbAppId} />}

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={twitterHandle} />
            <meta name="twitter:title" content={title || defaultTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image || defaultImage} />

            {/* Mobile Optimization Meta Tags */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            <meta name="theme-color" content="#1a73e8" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="format-detection" content="telephone=no" />
            
            {/* Touch Icon Meta Tags */}
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            
            {/* AMP Link */}
            <link rel="amphtml" href={`${siteUrl}${path}/amp`} />
        </Helmet>
    );
}

export default SEO; 