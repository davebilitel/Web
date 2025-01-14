import React from 'react';
import { Helmet } from 'react-helmet-async';
import { seoConfig } from '../../config/seo';

function VisaCardAMP() {
    return (
        <>
            <Helmet>
                <script async src="https://cdn.ampproject.org/v0.js"></script>
                <style amp-boilerplate>{`body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`}</style>
                <link rel="canonical" href={`${seoConfig.siteUrl}/visa`} />
                <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
            </Helmet>

            <div className="amp-content">
                <h1>Visa Virtual Card</h1>
                {/* Add AMP-specific content for Visa card page */}
            </div>
        </>
    );
}

export default VisaCardAMP; 