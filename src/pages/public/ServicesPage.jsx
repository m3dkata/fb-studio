import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { useServices } from '../../hooks/useServices';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { SERVICE_CATEGORIES, CATEGORY_LABELS } from '../../utils/constants';

const ServicesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category') || '';
    const [searchTerm, setSearchTerm] = useState('');

    const { data: services, isLoading, error } = useServices({
        category: categoryFilter || undefined,
        active: true
    });

    const handleCategoryChange = (value) => {
        if (value) {
            setSearchParams({ category: value });
        } else {
            setSearchParams({});
        }
    };

    const filteredServices = services?.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8 relative">
            { }
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-green-200/20 dark:bg-green-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
            </div>

            <div className="text-center max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="text-gradient">Services</span></h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Explore our range of professional beauty treatments designed to help you look and feel your best.
                </p>
            </div>

            { }
            <div className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a service..."
                        className="pl-14 pr-6 block w-full rounded-2xl border-2 border-gray-200 bg-white focus:bg-white transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 py-4 text-base shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            { }
            <div className="mb-12">
                <div className="flex flex-wrap gap-3 justify-center items-center">
                    <button
                        onClick={() => handleCategoryChange('')}
                        className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${!categoryFilter
                                ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        All Services
                    </button>
                    {Object.values(SERVICE_CATEGORIES).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${categoryFilter === cat
                                    ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            {CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    Failed to load services. Please try again later.
                </div>
            ) : filteredServices?.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg">No services found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredServices.map((service) => (
                        <Card key={service.id} className="group h-full flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                            <div className="h-64 relative overflow-hidden rounded-t-xl">
                                {service.image ? (
                                    <img
                                        src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/services/${service.id}/${service.image}`}
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-gray-900 shadow-sm">
                                        {CATEGORY_LABELS[service.category]}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            <CardContent className="flex-grow p-6 flex flex-col relative">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1 font-heading group-hover:text-primary transition-colors">
                                        {service.title}
                                    </h3>
                                    <span className="text-xl font-bold text-primary">
                                        ${service.price}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-primary" />
                                    <span>{service.duration} mins</span>
                                </div>

                                <div
                                    className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: service.description }}
                                />

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Link to={`/services/${service.id}`}>
                                        <Button className="w-full group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                                            View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
