import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Calendar } from 'lucide-react';
import { useService } from '../../hooks/useServices';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CATEGORY_LABELS } from '../../utils/constants';

const ServiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { data: service, isLoading, error } = useService(id);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">The service you are looking for does not exist or has been removed.</p>
                <Link to="/services">
                    <Button variant="outline">Back to Services</Button>
                </Link>
            </div>
        );
    }

    const handleBookNow = () => {
        if (isAuthenticated) {
            navigate(`/book/${id}`);
        } else {
            navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/services" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                { }
                <div className="relative rounded-xl overflow-hidden shadow-lg h-[300px] md:h-[400px] lg:h-[500px]">
                    {service.image ? (
                        <img
                            src={`${import.meta.env.VITE_POCKETBASE_URL}/api/files/services/${service.id}/${service.image}`}
                            alt={service.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No Image Available
                        </div>
                    )}
                    <div className="absolute top-4 right-4">
                        <Badge variant="primary" className="text-sm px-3 py-1">
                            {CATEGORY_LABELS[service.category]}
                        </Badge>
                    </div>
                </div>

                { }
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {service.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 mb-8">
                        <div className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300">
                            <DollarSign className="h-5 w-5 text-primary mr-1" />
                            {service.price}
                        </div>
                        <div className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300">
                            <Clock className="h-5 w-5 text-primary mr-1" />
                            {service.duration} mins
                        </div>
                    </div>

                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">Description</h3>
                            <div
                                className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                                dangerouslySetInnerHTML={{ __html: service.description }}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="flex-1" onClick={handleBookNow}>
                            <Calendar className="h-5 w-5 mr-2" />
                            Book Appointment
                        </Button>
                        {!isAuthenticated && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left mt-2 sm:mt-0 flex items-center">
                                * You'll need to login to book
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;
