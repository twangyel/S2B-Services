import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  Zap,
  Wrench,
  ShieldCheck,
  DollarSign,
  Phone,
  ChevronRight,
  SearchIcon,
  Star,
} from 'lucide-react';
import type { Banner, Provider, ServiceCategory } from '@/types';
import { fetchBanners, fetchProviderDirectory, fetchServiceCategories } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import ServiceCategoryCard from '@/components/cards/ServiceCategoryCard';
import ProviderCompactCard from '@/components/cards/ProviderCompactCard';
import ProviderCard from '@/components/cards/ProviderCard';
import NotificationBell from '@/components/common/NotificationBell';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] } },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const emergencyCategories = ['electrician', 'plumber', 'vehicle-mechanic'];

export default function Home() {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const greeting = useMemo(() => getGreeting(), []);

  const popularCategories = categories.filter((c) => c.isPopular).slice(0, 8);
  const nearbyProviders = providers
    .filter((p) => p.isVerified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
  const featuredProviders = providers.filter((p) => p.isFeatured).slice(0, 3);
  const moreCategories = categories.filter((c) => !c.isPopular).slice(0, 9);

  useEffect(() => {
    let active = true;
    void Promise.all([fetchServiceCategories(), fetchProviderDirectory(), fetchBanners()])
      .then(([nextCategories, nextProviders, nextBanners]) => {
        if (!active) return;
        setCategories(nextCategories);
        setProviders(nextProviders);
        setBanners(nextBanners);
      })
      .catch((error: unknown) => {
        console.error('[S2B Services] Unable to load home catalog:', error);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="bg-white px-4 pb-3 pt-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {greeting}
            </h1>
            <button className="mt-1 flex items-center gap-1 text-sm text-foreground-muted">
              <MapPin className="h-4 w-4 text-primary" />
              Set your location
            </button>
          </div>
          <NotificationBell className="border border-border bg-white shadow-sm" />
        </div>
      </motion.header>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="bg-white px-4 pb-4">
        <button
          onClick={() => navigate('/services')}
          className="flex h-12 w-full items-center gap-3 rounded-full bg-muted px-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Search className="h-5 w-5 text-foreground-subtle" />
          <span className="text-sm text-foreground-subtle">What service do you need?</span>
        </button>
      </motion.div>

      <div className="space-y-5 pb-6">
        {/* Hero Banner Carousel */}
        <motion.section variants={itemVariants} className="relative px-4">
          <div
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => navigate(banner.ctaTarget)}
                className={cn(
                  'w-full flex-shrink-0 snap-start rounded-2xl p-5 text-left transition-all',
                  index % 3 === 0 && 'bg-primary-light',
                  index % 3 === 1 && 'bg-secondary-light',
                  index % 3 === 2 && 'bg-error-light'
                )}
              >
                <h3
                  className={cn(
                    'text-lg font-bold',
                    index % 3 === 0 && 'text-primary',
                    index % 3 === 1 && 'text-secondary-dark',
                    index % 3 === 2 && 'text-error'
                  )}
                >
                  {banner.title}
                </h3>
                <p className="mt-1 text-sm text-foreground-muted">{banner.subtitle}</p>
                <span
                  className={cn(
                    'mt-3 inline-flex items-center gap-1 text-sm font-semibold',
                    index % 3 === 0 && 'text-primary',
                    index % 3 === 1 && 'text-secondary-dark',
                    index % 3 === 2 && 'text-error'
                  )}
                >
                  {banner.ctaText}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === currentBanner ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>
        </motion.section>

        {/* Emergency Shortcut */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="rounded-xl border-l-4 border-l-error bg-error-light p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-error" />
              <h3 className="text-base font-bold text-error">Need urgent help?</h3>
            </div>
            <p className="mt-0.5 text-sm text-foreground-muted">Emergency services available now</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {emergencyCategories.map((catId) => {
                const cat = categories.find((c) => c.id === catId);
                if (!cat) return null;
                return (
                  <button
                    key={catId}
                    onClick={() => navigate(`/services/${catId}?emergency=true`)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-error shadow-sm transition-transform active:scale-95"
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Popular Services */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-lg font-bold text-foreground">Popular Services</h2>
            <button
              onClick={() => navigate('/services')}
              className="flex items-center gap-0.5 text-sm font-medium text-primary"
            >
              See All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 scrollbar-hide">
            {popularCategories.map((cat) => (
              <ServiceCategoryCard key={cat.id} category={cat} variant="horizontal" />
            ))}
          </div>
        </motion.section>

        {/* Nearby Verified Providers */}
        {nearbyProviders.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="text-lg font-bold text-foreground">Nearby Verified Providers</h2>
            </div>
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 scrollbar-hide">
              {nearbyProviders.map((provider) => (
                <ProviderCompactCard key={provider.id} provider={provider} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Featured Providers */}
        {featuredProviders.length > 0 && (
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between px-4 py-2">
              <h2 className="flex items-center gap-1.5 text-lg font-bold text-foreground">
                <Star className="h-5 w-5 fill-secondary text-secondary" />
                Featured Providers
              </h2>
            </div>
            <div className="space-y-3 px-4">
              {featuredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          </motion.section>
        )}

        {/* How It Works */}
        <motion.section variants={itemVariants} className="px-4">
          <h2 className="mb-3 text-lg font-bold text-foreground">How It Works</h2>
          <div className="rounded-xl bg-white p-4 shadow-card">
            <div className="grid grid-cols-4 gap-3">
              {[
                { step: 1, title: 'Search', desc: 'Find the service you need', icon: SearchIcon },
                { step: 2, title: 'Verify', desc: 'Pick a verified provider', icon: ShieldCheck },
                { step: 3, title: 'Contact', desc: 'Call or WhatsApp', icon: Phone },
                { step: 4, title: 'Rate', desc: 'Review the service', icon: Star },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {item.step}
                  </div>
                  <item.icon className="mt-2 h-5 w-5 text-primary" />
                  <p className="mt-1 text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-foreground-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Trust Badges */}
        <motion.section variants={itemVariants} className="px-4">
          <h2 className="mb-3 text-lg font-bold text-foreground">Trust & Safety</h2>
          <div className="rounded-xl bg-white shadow-card">
            {[
              {
                icon: ShieldCheck,
                color: 'text-primary',
                bg: 'bg-primary-light',
                title: 'Verified Providers',
                desc: 'All providers are identity and skill verified',
              },
              {
                icon: DollarSign,
                color: 'text-secondary',
                bg: 'bg-secondary-light',
                title: 'Transparent Pricing',
                desc: 'Clear visit charges before you book',
              },
              {
                icon: Phone,
                color: 'text-success',
                bg: 'bg-success-light',
                title: 'Direct Contact',
                desc: 'Call or WhatsApp providers directly',
              },
            ].map((item, index, arr) => (
              <div
                key={item.title}
                className={cn(
                  'flex items-start gap-3 p-4',
                  index < arr.length - 1 && 'border-b border-border'
                )}
              >
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', item.bg)}>
                  <item.icon className={cn('h-5 w-5', item.color)} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  <p className="mt-0.5 text-xs text-foreground-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* More Services Grid */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-lg font-bold text-foreground">More Services</h2>
            <button
              onClick={() => navigate('/services')}
              className="flex items-center gap-0.5 text-sm font-medium text-primary"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 px-4">
            {moreCategories.map((cat) => (
              <ServiceCategoryCard key={cat.id} category={cat} variant="grid" />
            ))}
          </div>
        </motion.section>

        {/* Become Provider CTA */}
        <motion.section variants={itemVariants} className="px-4">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary-light p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-3 text-base font-bold text-foreground">Are you a service provider?</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Join S2B Services and grow your business
            </p>
            <button
              onClick={() => navigate('/become-provider')}
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-button transition-colors hover:bg-primary-dark active:bg-primary-dark"
            >
              Become a Provider
            </button>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
