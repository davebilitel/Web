import React from 'react';
import Skeleton from './Skeleton';

function CardSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-2/5 p-8 lg:p-12">
                            <Skeleton variant="rectangular" width={120} height={48} className="mb-8" />
                            <Skeleton variant="text" width="80%" className="mb-4" />
                            <div className="space-y-6">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} variant="text" width="60%" />
                                ))}
                            </div>
                        </div>
                        <div className="md:w-3/5 p-8 lg:p-12">
                            <div className="aspect-[1.586/1] bg-gray-100 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardSkeleton; 