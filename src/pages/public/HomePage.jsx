import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Calendar, Clock, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardContent } from '../../components/ui/Card';
import { useServices } from '../../hooks/useServices';
import pb from '../../services/pocketbase';

const HomePage = () => {
    const { data: services, isLoading } = useServices();
    const featuredServices = services?.filter(s => s.active).slice(0, 3) || [];
    return (
        <div className="flex flex-col -mt-20"> {/* Negative margin to pull hero under header */}

            {/* Hero Section */}
            <section className="relative flex items-center justify-center min-h-screen pt-20 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-50 to-white dark:from-gray-900 dark:to-gray-800" />
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-green-400/20 rounded-full blur-[100px] animate-float" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
                </div>

                <div className="container relative z-10 grid items-center gap-12 px-4 mx-auto lg:grid-cols-2">
                    <div className="space-y-8 text-center lg:text-left animate-slide-up">
                        <div className="inline-flex items-center px-4 py-2 border rounded-full shadow-sm bg-white/50 dark:bg-white/10 border-white/20 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Premium Beauty Services</span>
                        </div>

                        <h1 className="text-5xl font-bold leading-tight lg:text-7xl">
                            Reveal Your <br />
                            <span className="text-gradient">Outer Radiance</span>
                        </h1>

                        <p className="max-w-lg mx-auto text-xl leading-relaxed text-gray-600 dark:text-gray-300 lg:mx-0">
                            Experience the art of beauty with our exclusive makeup, lash, and brow treatments.
                            Tailored perfection for the modern you.
                        </p>

                        <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                            <Link to="/services">
                                <Button size="lg" className="w-full shadow-xl sm:w-auto shadow-primary/20">
                                    Book Appointment <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            {!pb.authStore.isValid && (
                                <Link to="/register">
                                    <Button variant="outline" size="lg" className="w-full bg-white sm:w-auto backdrop-blur-sm">
                                        Create Account
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center justify-center pt-8 space-x-8 text-gray-500 lg:justify-start">
                            <div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">500+</p>
                                <p className="text-sm">Happy Clients</p>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                            <div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">4.9</p>
                                <p className="text-sm">Average Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-12 lg:mt-0 lg:block animate-fade-in">
                        <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="/fb-studio.jpeg" alt="FB Studio" className="object-cover w-full h-auto" />
                        </div>
                        {/* Floating Cards */}
                        <div className="absolute z-20 p-4 shadow-lg -bottom-6 -left-4 lg:-bottom-10 lg:-left-10 glass rounded-xl animate-float" style={{ animationDelay: '1s' }}>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 text-green-600 bg-green-100 rounded-full dark:bg-green-900/50 dark:text-green-400">
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Top Rated</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Best in City</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 bg-white dark:bg-gray-900">
                <div className="container px-4 mx-auto">
                    <div className="max-w-2xl mx-auto mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose FB Studio?</h2>
                        <p className="text-gray-600 dark:text-gray-400">We combine artistry with premium products to deliver results that exceed expectations.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            { icon: Star, title: "Premium Experience", desc: "Luxury products and VIP treatment for every client.", color: "text-green-500", bg: "bg-green-50" },
                            { icon: Calendar, title: "Easy Scheduling", desc: "Book 24/7 with our seamless online booking system.", color: "text-teal-500", bg: "bg-teal-50" },
                            { icon: Clock, title: "Flexible Hours", desc: "Early morning and late evening slots to fit your busy life.", color: "text-orange-500", bg: "bg-orange-50" }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 transition-all duration-300 border border-transparent group rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:shadow-xl hover:border-gray-100 dark:hover:border-gray-600">
                                <div className={`w-14 h-14 rounded-xl ${feature.bg} dark:bg-gray-700 ${feature.color} dark:text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                                <p className="leading-relaxed text-gray-600 dark:text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Preview */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800">
                <div className="container px-4 mx-auto">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Signature Services</h2>
                            <p className="text-gray-600 dark:text-gray-400">Curated treatments for your unique style</p>
                        </div>
                        <Link to="/services" className="hidden md:block">
                            <Button variant="ghost" className="group">
                                View All Services <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>

                    {!isLoading && (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {featuredServices.length > 0 ? (
                                featuredServices.map((service) => {
                                    const imageUrl = service.image
                                        ? `${pb.baseUrl}/api/files/${service.collectionId}/${service.id}/${service.image}`
                                        : 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                                    return (
                                        <Link key={service.id} to={`/services/${service.id}`}>
                                            <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-[400px]">
                                                <img
                                                    src={imageUrl}
                                                    alt={service.title}
                                                    className="absolute inset-0 object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 transition-opacity bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90" />
                                                <div className="absolute bottom-0 left-0 w-full p-8 transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                    <h3 className="mb-2 text-2xl font-bold text-white">{service.title}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-medium text-white/90">Starting at ${service.price}</span>
                                                        <div className="flex items-center justify-center w-10 h-10 text-white transition-opacity duration-300 rounded-full opacity-0 bg-white/20 backdrop-blur-md group-hover:opacity-100">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="col-span-3 py-16 text-center text-gray-500 dark:text-gray-400">
                                    <p className="text-lg font-medium">No services available yet</p>
                                    <p className="mt-1 text-sm">Check back soon for our amazing services!</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-12 text-center md:hidden">
                        <Link to="/services">
                            <Button className="w-full">View All Services</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-green-600" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                <div className="container relative z-10 px-4 mx-auto text-center">
                    <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Ready to Glow?</h2>
                    <p className="max-w-2xl mx-auto mb-10 text-xl text-green-100">
                        Join our community of beautiful, confident clients. Book your first appointment today and get 10% off.
                    </p>
                    {!pb.authStore.isValid && (
                        <Link to="/register">
                            <Button size="lg" className="text-green-600 bg-white border-none shadow-2xl hover:bg-gray-100">
                                Get Started Now
                            </Button>
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
