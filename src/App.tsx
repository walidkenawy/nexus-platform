import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Palette, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  ChevronRight,
  Globe,
  FileText,
  Zap,
  Lock,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Plus,
  Eye,
  ExternalLink,
  Trash2,
  ArrowUpRight,
  Package,
  Users,
  Activity,
  BarChart3,
  Search,
  Filter,
  Send,
  Bot,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation,
  Navigate
} from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { cn } from './lib/utils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

import { GoogleGenAI } from "@google/genai";

// --- Components ---

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: "Welcome to Nexus Elite. I am your personal concierge. How may I assist your global ambitions today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Convert history to Gemini format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: "You are the Nexus Elite Concierge, an ultra-luxury AI assistant for a high-end business consulting and product compliance firm. Your tone is sophisticated, professional, and highly helpful. You assist clients with business setup in Europe, product registration, branding, and manufacturing. You should sound like a world-class private banker or a luxury hotel concierge. Keep responses concise but elegant.",
        }
      });

      const modelResponse = response.text || "I apologize, but I am unable to process that request at the moment. Please contact our human concierge for immediate assistance.";
      setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered a technical interruption. Our elite support team has been notified." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] h-[600px] glass rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Elite Concierge</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
            >
              {messages.map((m, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-brand-purple text-white rounded-tr-none" 
                      : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-gray-600 mt-1.5 uppercase tracking-widest font-bold">
                    {m.role === 'user' ? 'You' : 'Concierge'}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start max-w-[85%] mr-auto">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Inquire about our services..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-brand-dark border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:border-brand-purple/50 outline-none transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-purple text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-widest font-bold">
                Powered by Nexus Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full luxury-shadow flex items-center justify-center transition-all duration-500",
          isOpen ? "bg-white text-brand-dark rotate-90" : "bg-brand-purple text-white"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

const FadeIn = ({ children, delay = 0, direction = 'up', distance = 40 }: { children: React.ReactNode, delay?: number, direction?: 'up' | 'down' | 'left' | 'right', distance?: number, key?: any }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.4, 0, 0.2, 1] 
      }}
    >
      {children}
    </motion.div>
  );
};

const TextReveal = ({ text, className }: { text: string, className?: string }) => {
  const words = text.split(' ');
  
  return (
    <div className={cn("overflow-hidden flex flex-wrap gap-x-[0.2em]", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: i * 0.05, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-brand-dark/80 backdrop-blur-md border-b border-white/5" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform luxury-shadow">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">NEXUS ELITE</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
          <Link to="/services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Services</Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              {isAdmin && <Link to="/admin" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Admin</Link>}
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-xs font-bold luxury-shadow">
                {user.displayName?.[0] || user.email?.[0]}
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors luxury-shadow"
            >
              Client Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-brand-surface border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Home</Link>
            <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Services</Link>
            <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Pricing</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium">Dashboard</Link>
                <button onClick={handleLogout} className="text-lg font-medium text-left text-red-400">Logout</button>
              </>
            ) : (
              <button onClick={handleLogin} className="w-full py-3 bg-brand-purple rounded-xl font-bold">Start Now</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const HomePage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[150px] -z-10" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[150px] -z-10" 
        />
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <FadeIn delay={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 mb-8">
                <Zap className="w-3 h-3" />
                <span>Elite Business Concierge</span>
              </div>
            </FadeIn>
            
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.95] mb-10 tracking-tighter">
              <TextReveal text="Launch Your Business" />
              <div className="overflow-hidden">
                <motion.span 
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="gradient-text inline-block"
                >
                  in the UK & EU
                </motion.span>
              </div>
            </h1>

            <FadeIn delay={0.6}>
              <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed font-light">
                From idea to market. We provide high-end business formation and product compliance for the world's most ambitious entrepreneurs.
              </p>
            </FadeIn>

            <FadeIn delay={0.8}>
              <div className="flex flex-wrap gap-6">
                <Link to="/consultation" className="px-10 py-5 bg-white text-black rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 luxury-shadow hover-glow">
                  Start Your Business <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/consultation" className="px-10 py-5 glass rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all hover:bg-white/5">
                  Book Private Consultation
                </Link>
              </div>
            </FadeIn>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="relative hidden lg:block floating"
          >
            <div className="glass p-10 rounded-[40px] relative z-10 luxury-shadow">
              <div className="flex items-center justify-between mb-10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Nexus Elite OS</div>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Strategic Formation', status: 'Active', color: 'text-indigo-400' },
                  { label: 'CPNP Compliance', status: 'Secured', color: 'text-blue-400' },
                  { label: 'Market Entry', status: 'Optimized', color: 'text-purple-400' },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1), duration: 0.8 }}
                    className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/[0.05]"
                  >
                    <span className="font-medium text-sm tracking-tight">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", item.color.replace('text', 'bg'))} />
                      <span className={cn("text-[10px] font-mono uppercase tracking-widest", item.color)}>{item.status}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeIn>
              <h2 className="text-5xl font-display font-bold mb-6">Concierge Solutions</h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">Tailored strategies for global market dominance. We handle the complexity, you lead the growth.</p>
            </FadeIn>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Business Setup', desc: 'UK LTD & EU Company formation with strategic VAT architecture and banking setup.' },
              { icon: ShieldCheck, title: 'Product Compliance', desc: 'CPNP, SCPN, and safety documentation for cosmetics, perfumes, and household products.' },
              { icon: Package, title: 'Private Label Services', desc: 'Bespoke formulation and premium manufacturing in certified EU/UK facilities.' },
              { icon: Palette, title: 'Branding & Digital', desc: 'High-end visual identity, bespoke digital flagships, and luxury market positioning.' },
              { icon: TrendingUp, title: 'Growth & Scaling', desc: 'Advanced e-commerce infrastructure, global logistics, and data-driven scaling.' },
            ].map((service, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div 
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="glass p-10 rounded-[32px] hover:border-brand-purple/30 transition-all group hover-glow"
                >
                  <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-purple/20 transition-colors">
                    <service.icon className="text-brand-purple w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight">{service.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light">{service.desc}</p>
                  <Link to="/services" className="text-xs font-bold uppercase tracking-widest text-brand-purple flex items-center gap-2 underline-animation w-fit">
                    Explore <ChevronRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6 bg-white/[0.01] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <FadeIn>
              <h2 className="text-5xl font-display font-bold mb-6">The Elite Process</h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-gray-400 max-w-2xl mx-auto font-light">A seamless journey from vision to market leadership.</p>
            </FadeIn>
          </div>
 
          <div className="grid md:grid-cols-4 gap-12 relative">
            {/* Connecting Line */}
            <div className="absolute top-12 left-0 right-0 h-[1px] bg-white/5 hidden md:block">
              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-brand-purple origin-left"
              />
            </div>

            {[
              { step: '01', title: 'Submit Request', desc: 'Provide your project details through our secure portal.' },
              { step: '02', title: 'We Review', desc: 'Our experts analyze your requirements and market potential.' },
              { step: '03', title: 'Private Consultation', desc: 'A dedicated strategist outlines your custom roadmap.' },
              { step: '04', title: 'Launch & Scale', desc: 'Execute with precision and dominate your target markets.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={0.4 + (i * 0.1)}>
                <div className="relative group">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="text-6xl font-display font-bold text-white/5 mb-6 group-hover:text-brand-purple/20 transition-colors"
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
 
      {/* Consultation Section */}
      <section className="py-32 px-6">
        <FadeIn distance={60}>
          <div className="max-w-5xl mx-auto glass p-16 rounded-[48px] text-center relative overflow-hidden luxury-shadow hover-glow">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[100px] -z-10" />
            <h2 className="text-5xl font-display font-bold mb-6">Get a Custom Quote for Your Business</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
              Every project is tailored. Submit your details and our team will contact you for a private consultation.
            </p>
            <Link to="/consultation" className="inline-flex items-center gap-3 px-12 py-6 bg-brand-purple rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all luxury-shadow hover-glow">
              Request Consultation <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
};
 
const ServicesPage = () => {
  const categories = [
    {
      id: 'setup',
      title: 'Business Setup',
      icon: Globe,
      features: ['VAT Architecture', 'Banking Liaison', 'Registered Office'],
      items: [
        { name: 'UK LTD Formation', desc: 'Strategic, white-glove registration with Companies House, including registered office services and full statutory compliance for global visionaries.', link: '/consultation' },
        { name: 'EU Company (Poland/Estonia)', desc: 'Establish a prestigious European presence with bespoke formation in strategic jurisdictions, ensuring seamless access to the single market.', link: '/consultation' },
        { name: 'VAT & Tax Architecture', desc: 'Sophisticated cross-border tax structuring and VAT optimization designed to protect your margins and ensure absolute regulatory harmony.', link: '/consultation' }
      ]
    },
    {
      id: 'compliance',
      title: 'Product Registration',
      icon: ShieldCheck,
      features: ['CPNP/SCPN Notification', 'Safety Reports (CPSR)', 'Label Review'],
      items: [
        { name: 'Cosmetic Compliance', desc: 'Comprehensive EU CPNP and UK SCPN notification management, including full technical dossier preparation for elite beauty and skincare brands.', link: '/product-registration' },
        { name: 'Perfume & Fragrance', desc: 'Specialized IFRA standards alignment and safety documentation, ensuring your olfactory creations meet the world\'s most rigorous regulatory benchmarks.', link: '/product-registration' },
        { name: 'Household & Cleaning', desc: 'Expert regulatory navigation for premium home care products, covering CLP compliance, safety data sheets, and multi-market notification.', link: '/product-registration' }
      ]
    },
    {
      id: 'privatelabel',
      title: 'Private Label Services',
      icon: Package,
      features: ['Custom Formulation', 'Bespoke Packaging', 'EU/UK Manufacturing'],
      items: [
        { name: 'Custom Formulation', desc: 'Collaborate with world-class chemists to engineer exclusive, high-performance formulas that embody your brand\'s unique DNA and efficacy standards.', link: '/consultation' },
        { name: 'Bespoke Packaging', desc: 'Curation and engineering of exquisite, sustainable packaging solutions that provide an unboxing experience as premium as the product itself.', link: '/consultation' },
        { name: 'Contract Manufacturing', desc: 'Precision-led production in certified, state-of-the-art facilities, offering scalable manufacturing with uncompromising quality control and artisanal attention.', link: '/consultation' }
      ]
    },
    {
      id: 'digital',
      title: 'Branding & Digital',
      icon: Palette,
      features: ['Luxury Positioning', 'Bespoke UI/UX', 'Conversion Optimization'],
      items: [
        { name: 'Elite Brand Identity', desc: 'Architecting bespoke visual systems and brand narratives that command authority and resonate with the world\'s most discerning luxury audiences.', link: '/consultation' },
        { name: 'Digital Flagship Store', desc: 'Engineering high-performance, immersive e-commerce environments that blend cinematic design with frictionless conversion architecture.', link: '/consultation' },
        { name: 'Marketing Strategy', desc: 'Bespoke, data-driven growth blueprints designed to elevate brand equity and capture market share in the competitive premium landscape.', link: '/consultation' }
      ]
    },
    {
      id: 'growth',
      title: 'Growth & Scaling',
      icon: TrendingUp,
      features: ['Global Logistics', 'Market Intelligence', 'Performance Ads'],
      items: [
        { name: 'Global Expansion', desc: 'A master-planned roadmap for international market entry, navigating cultural nuances and logistical complexities with concierge-level precision.', link: '/consultation' },
        { name: 'Performance Marketing', desc: 'Precision-targeted ad management and conversion optimization, leveraging elite data science to maximize ROI for high-end lifestyle brands.', link: '/consultation' },
        { name: 'Operational Excellence', desc: 'Institutional-grade streamlining of your business infrastructure, optimizing supply chains and workflows for rapid, high-volume global scaling.', link: '/consultation' }
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 text-center">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">Elite Solutions</h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Every business is unique. We provide tailored concierge services to ensure your vision is executed with absolute precision and market-leading compliance.
            </p>
          </FadeIn>
        </header>

        <div className="space-y-40">
          {categories.map((cat, catIdx) => (
            <div key={cat.id} className="relative">
              {/* Decorative Background Element */}
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-purple/5 rounded-full blur-[120px] -z-10" />
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
                <FadeIn delay={catIdx * 0.1}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center luxury-shadow">
                      <cat.icon className="text-brand-purple w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-display font-bold tracking-tight">{cat.title}</h2>
                      <div className="flex gap-4 mt-2">
                        {cat.features.map((f, i) => (
                          <span key={i} className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-brand-purple/40" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={catIdx * 0.1 + 0.1}>
                  <p className="text-sm text-gray-500 max-w-sm font-light italic">
                    Bespoke strategies tailored for elite market entry and sustained global growth.
                  </p>
                </FadeIn>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {cat.items.map((item, i) => (
                  <FadeIn key={i} delay={0.2 + (i * 0.1)}>
                    <motion.div 
                      whileHover={{ y: -10, scale: 1.02 }}
                      className="glass p-10 rounded-[32px] flex flex-col justify-between hover:border-brand-purple/30 transition-all group hover-glow h-full relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-5 h-5 text-brand-purple" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-brand-purple transition-colors">{item.name}</h3>
                        <p className="text-gray-400 text-sm mb-10 font-light leading-relaxed">{item.desc}</p>
                      </div>
                      <Link to={item.link} className="w-full py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-center font-bold hover:bg-white/10 transition-all luxury-shadow active:scale-95 flex items-center justify-center gap-2">
                        Request Service
                      </Link>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bespoke Section */}
        <FadeIn distance={60}>
          <div className="mt-40 glass p-16 rounded-[48px] text-center relative overflow-hidden luxury-shadow hover-glow border border-brand-purple/20">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 to-transparent opacity-50" />
            <h2 className="text-5xl font-display font-bold mb-6 relative z-10">Bespoke Enterprise Solutions</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light relative z-10">
              For large-scale operations requiring custom infrastructure, global logistics, and multi-market compliance management.
            </p>
            <Link to="/consultation" className="relative z-10 inline-flex items-center gap-3 px-12 py-6 bg-white text-black rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all luxury-shadow">
              Schedule Private Briefing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

const ConsultationWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessType: '',
    services: [] as string[],
    productType: '',
    productName: '',
    description: '',
    message: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please login to submit your request.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'services'), {
        userId: user.uid,
        type: 'consultation',
        status: 'pending',
        data: formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Basic Info', desc: 'Tell us who you are' },
    { title: 'Business Type', desc: 'Your current status' },
    { title: 'Services', desc: 'What do you need?' },
    { title: 'Details', desc: 'Product specifics' },
    { title: 'Message', desc: 'Final thoughts' },
    { title: 'Review', desc: 'Confirm details' }
  ];

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full glass p-12 rounded-[48px] luxury-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold mb-1">{steps[step-1].title}</h2>
            <p className="text-sm text-gray-500">{steps[step-1].desc}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-widest">Step {step} of 6</div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={cn(
                  "h-1 w-6 rounded-full transition-all duration-500",
                  step > i ? "bg-brand-purple" : "bg-white/10"
                )} />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all luxury-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all luxury-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all luxury-shadow"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} className="space-y-8">
              <h3 className="text-xl font-bold text-center mb-8">Select your business status</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { id: 'new', label: 'New Business', desc: 'Starting from scratch' },
                  { id: 'existing', label: 'Existing Business', desc: 'Scaling operations' }
                ].map((t) => (
                  <motion.button 
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, businessType: t.id })}
                    className={cn(
                      "p-8 rounded-[32px] border-2 transition-all text-center group",
                      formData.businessType === t.id ? "border-brand-purple bg-brand-purple/5" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                    )}
                  >
                    <div className="text-lg font-bold mb-2 group-hover:text-brand-purple transition-colors">{t.label}</div>
                    <div className="text-xs text-gray-500 font-light">{t.desc}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <h3 className="text-xl font-bold text-center mb-8">Which services do you require?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Company formation', 'VAT registration', 'Cosmetic registration (CPNP)', 
                  'Perfume compliance', 'Household products', 'Cleaning products', 
                  'Branding / website', 'Marketing / growth'
                ].map((s) => (
                  <button 
                    key={s}
                    onClick={() => toggleService(s)}
                    className={cn(
                      "p-5 rounded-2xl border text-sm transition-all text-center",
                      formData.services.includes(s) ? "border-brand-purple bg-brand-purple/10 text-white" : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Product Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Cosmetic', 'Perfume', 'Cleaning', 'Household'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setFormData({ ...formData, productType: t })}
                        className={cn(
                          "py-4 rounded-xl border text-sm transition-all",
                          formData.productType === t ? "border-brand-purple bg-brand-purple/10" : "border-white/5 bg-white/[0.02]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Luxury Face Oil"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Brief Description</label>
                  <textarea 
                    placeholder="Tell us about the product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple outline-none transition-all min-h-[100px]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-xl font-bold mb-4">Tell us about your project</h3>
              <textarea 
                placeholder="Vision, goals, and any specific requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-8 rounded-[32px] bg-white/[0.03] border border-white/10 focus:border-brand-purple outline-none transition-all min-h-[250px] luxury-shadow"
              />
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="p-8 bg-white/[0.02] rounded-[32px] border border-white/10 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Client</div>
                    <div className="font-bold">{formData.fullName}</div>
                    <div className="text-sm text-gray-400">{formData.email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</div>
                    <div className="font-bold capitalize">{formData.businessType}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Requested Services</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.services.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-[10px] font-bold text-brand-purple uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                {formData.productName && (
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Product Focus</div>
                    <div className="font-bold">{formData.productName} ({formData.productType})</div>
                  </div>
                )}
              </div>
              <div className="text-center text-sm text-gray-500 font-light">
                By submitting, you agree to our elite service terms and private consultation process.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 mt-16">
          {step > 1 && (
            <button onClick={handleBack} className="flex-1 py-5 glass rounded-2xl font-bold hover:bg-white/5 transition-all">Back</button>
          )}
          {step < 6 ? (
            <button 
              onClick={handleNext} 
              disabled={
                (step === 1 && (!formData.fullName || !formData.email)) ||
                (step === 2 && !formData.businessType) ||
                (step === 3 && formData.services.length === 0)
              }
              className="flex-[2] py-5 bg-white text-black rounded-2xl font-bold disabled:opacity-30 transition-all luxury-shadow"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-brand-purple rounded-2xl font-bold hover:opacity-90 transition-all luxury-shadow flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Request My Consultation"}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductWizardPage = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    physicalForm: '',
    ingredients: '',
    documents: [] as { 
      id: string,
      name: string, 
      type: string,
      version: string,
      dateIssued: string,
      authority: string,
      url: string,
      fileType: string
    }[],
    intendedMarket: '',
    hasNanomaterials: false,
    safetyAssessment: '',
    regulatoryInfo: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAddDocument = (docType: string) => {
    // In a real app, this would be a file upload. 
    // Here we mock the addition of a document with a preview URL.
    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${docType.replace('_', ' ')} Document.pdf`,
      type: docType,
      version: '1.0',
      dateIssued: new Date().toISOString().split('T')[0],
      authority: '',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Sample PDF
      fileType: 'application/pdf'
    };
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  const removeDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("Please login to submit your request.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'services'), {
        userId: user.uid,
        type: 'product_reg',
        status: 'pending',
        data: formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'Identity', desc: 'Product basics' },
    { title: 'Composition', desc: 'Ingredients & INCI' },
    { title: 'Dossier', desc: 'Technical documents' },
    { title: 'Compliance', desc: 'Regulatory details' },
    { title: 'Review', desc: 'Final validation' }
  ];

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full glass p-12 rounded-[48px] luxury-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full blur-[100px] -z-10" />
        
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-display font-bold mb-1">{steps[step-1].title}</h2>
            <p className="text-sm text-gray-500">{steps[step-1].desc}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-widest">Step {step} of 5</div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div key={i} className={cn(
                  "h-1 w-6 rounded-full transition-all duration-500",
                  step > i ? "bg-brand-purple" : "bg-white/10"
                )} />
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Midnight Recovery Elixir"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all luxury-shadow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all"
                    >
                      <option value="" className="bg-brand-dark">Select Category</option>
                      <option value="skin" className="bg-brand-dark">Skin Care</option>
                      <option value="hair" className="bg-brand-dark">Hair Care</option>
                      <option value="fragrance" className="bg-brand-dark">Fragrance</option>
                      <option value="oral" className="bg-brand-dark">Oral Care</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Physical Form</label>
                    <select 
                      value={formData.physicalForm}
                      onChange={(e) => setFormData({ ...formData, physicalForm: e.target.value })}
                      className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all"
                    >
                      <option value="" className="bg-brand-dark">Select Form</option>
                      <option value="cream" className="bg-brand-dark">Cream / Lotion</option>
                      <option value="liquid" className="bg-brand-dark">Liquid / Serum</option>
                      <option value="oil" className="bg-brand-dark">Oil</option>
                      <option value="powder" className="bg-brand-dark">Powder</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }} className="space-y-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Full INCI Ingredient List</label>
              <textarea 
                placeholder="Aqua, Glycerin, Niacinamide, Sodium Hyaluronate..."
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full p-8 rounded-[32px] bg-white/[0.03] border border-white/10 focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 outline-none transition-all min-h-[300px] luxury-shadow"
              />
              <p className="text-[10px] text-gray-500 italic">Please ensure ingredients are listed in descending order of concentration.</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 gap-6">
                {[
                  { label: 'Master Formula', type: 'formula' },
                  { label: 'Safety Assessment (CPSR)', type: 'safety_report' },
                  { label: 'MSDS / Technical Data', type: 'technical' }
                ].map((docType) => {
                  const existingDoc = formData.documents.find(d => d.type === docType.type);
                  return (
                    <div key={docType.type} className="space-y-4">
                      {!existingDoc ? (
                        <button 
                          onClick={() => handleAddDocument(docType.type)}
                          className="w-full p-8 border-2 border-dashed border-white/10 rounded-[32px] bg-white/[0.02] hover:bg-white/[0.05] hover:border-brand-purple/30 transition-all flex flex-col items-center justify-center gap-4 group"
                        >
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-purple/10 transition-colors">
                            <Plus className="text-gray-500 group-hover:text-brand-purple w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-sm mb-1">Upload {docType.label}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">PDF, JPG or PNG (Max 10MB)</div>
                          </div>
                        </button>
                      ) : (
                        <div className="glass p-6 rounded-[32px] border border-brand-purple/20 bg-brand-purple/5 relative overflow-hidden">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center relative group">
                                {existingDoc.fileType.includes('pdf') ? (
                                  <FileText className="text-brand-purple w-7 h-7" />
                                ) : (
                                  <div className="w-full h-full rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${existingDoc.url})` }} />
                                )}
                                <a 
                                  href={existingDoc.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"
                                >
                                  <Eye className="w-5 h-5 text-white" />
                                </a>
                              </div>
                              <div>
                                <h4 className="font-bold text-sm truncate max-w-[200px]">{existingDoc.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{docType.label}</span>
                                  <a href={existingDoc.url} target="_blank" rel="noreferrer" className="text-[10px] text-brand-purple font-bold hover:underline flex items-center gap-1">
                                    Preview <ExternalLink className="w-2 h-2" />
                                  </a>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeDocument(existingDoc.id)}
                              className="p-2 hover:bg-red-500/10 rounded-full transition-colors group"
                            >
                              <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-red-500" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1 ml-1">
                                {docType.type === 'formula' ? 'Formula Version' : 'Version'}
                              </label>
                              <input 
                                type="text"
                                placeholder="e.g. 1.0"
                                value={existingDoc.version}
                                onChange={(e) => {
                                  const newDocs = formData.documents.map(d => d.id === existingDoc.id ? { ...d, version: e.target.value } : d);
                                  setFormData({ ...formData, documents: newDocs });
                                }}
                                className="w-full p-2 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-brand-purple outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1 ml-1">
                                {docType.type === 'formula' ? 'Date Issued' : 'Issued Date'}
                              </label>
                              <input 
                                type="date"
                                value={existingDoc.dateIssued}
                                onChange={(e) => {
                                  const newDocs = formData.documents.map(d => d.id === existingDoc.id ? { ...d, dateIssued: e.target.value } : d);
                                  setFormData({ ...formData, documents: newDocs });
                                }}
                                className="w-full p-2 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-brand-purple outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1 ml-1">
                                {docType.type === 'formula' ? 'Issuing Authority' : 'Authority'}
                              </label>
                              <input 
                                type="text"
                                placeholder={docType.type === 'formula' ? "e.g. R&D Dept" : "e.g. Intertek"}
                                value={existingDoc.authority}
                                onChange={(e) => {
                                  const newDocs = formData.documents.map(d => d.id === existingDoc.id ? { ...d, authority: e.target.value } : d);
                                  setFormData({ ...formData, documents: newDocs });
                                }}
                                className="w-full p-2 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-brand-purple outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Intended Market</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['United Kingdom', 'European Union', 'Both'].map((m) => (
                      <button 
                        key={m}
                        onClick={() => setFormData({ ...formData, intendedMarket: m })}
                        className={cn(
                          "py-4 rounded-2xl border text-sm transition-all",
                          formData.intendedMarket === m ? "border-brand-purple bg-brand-purple/10" : "border-white/5 bg-white/[0.02]"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 glass rounded-2xl border border-white/5">
                  <div>
                    <div className="font-bold text-sm">Contains Nanomaterials?</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Requires 6-month pre-notification</div>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, hasNanomaterials: !formData.hasNanomaterials })}
                    className={cn(
                      "w-14 h-8 rounded-full transition-all relative",
                      formData.hasNanomaterials ? "bg-brand-purple" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg",
                      formData.hasNanomaterials ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Safety Assessment Status</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Completed by Eurofins (Ref: #12345)"
                    value={formData.safetyAssessment}
                    onChange={(e) => setFormData({ ...formData, safetyAssessment: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Additional Regulatory Notes</label>
                  <textarea 
                    placeholder="Specific claims, warnings, or special storage requirements..."
                    value={formData.regulatoryInfo}
                    onChange={(e) => setFormData({ ...formData, regulatoryInfo: e.target.value })}
                    className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-brand-purple outline-none transition-all min-h-[100px]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="p-8 bg-white/[0.02] rounded-[32px] border border-white/10 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Product</div>
                    <div className="font-bold text-lg">{formData.productName || 'Unnamed Product'}</div>
                    <div className="text-xs text-gray-400 capitalize">{formData.category} — {formData.physicalForm}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Market</div>
                    <div className="font-bold">{formData.intendedMarket || 'Not Specified'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Technical Dossier</div>
                  <div className="space-y-3">
                    {formData.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-brand-purple" />
                          <div>
                            <div className="text-xs font-bold">{doc.name}</div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest">v{doc.version} — {doc.authority || 'Internal'}</div>
                          </div>
                        </div>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                    ))}
                    {formData.documents.length === 0 && <div className="text-xs text-gray-500 italic">No documents attached.</div>}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Ingredients (INCI)</div>
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{formData.ingredients || 'No ingredients provided.'}</p>
                </div>
              </div>
              <div className="text-center text-sm text-gray-500 font-light">
                By submitting, you confirm the accuracy of the technical dossier for CPNP/SCPN notification.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6 mt-16">
          {step > 1 && (
            <button onClick={handleBack} className="flex-1 py-5 glass rounded-2xl font-bold hover:bg-white/5 transition-all">Back</button>
          )}
          {step < 5 ? (
            <button 
              onClick={handleNext} 
              disabled={
                (step === 1 && (!formData.productName || !formData.category)) ||
                (step === 2 && !formData.ingredients)
              }
              className="flex-[2] py-5 bg-white text-black rounded-2xl font-bold disabled:opacity-30 transition-all luxury-shadow"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-brand-purple rounded-2xl font-bold hover:opacity-90 transition-all luxury-shadow flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Submit for Compliance"}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'services'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Welcome back, {user?.displayName?.split(' ')[0]}</h1>
              <p className="text-gray-400">Track your business formation and compliance progress.</p>
            </div>
            <Link to="/product-registration" className="px-6 py-3 bg-brand-purple rounded-xl font-bold flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all luxury-shadow hover-glow">
              <Plus className="w-4 h-4" /> New Product
            </Link>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <FadeIn delay={0.1}>
            <div className="glass p-8 rounded-[32px] luxury-shadow h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Compliance Health</div>
                <div className="text-brand-purple font-bold">94%</div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Mon', value: 40 },
                    { name: 'Tue', value: 70 },
                    { name: 'Wed', value: 45 },
                    { name: 'Thu', value: 90 },
                    { name: 'Fri', value: 65 },
                    { name: 'Sat', value: 80 },
                    { name: 'Sun', value: 94 },
                  ]}>
                    <defs>
                      <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#dashboardGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <div className="glass p-8 rounded-[32px] luxury-shadow h-[280px] flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Request Distribution</div>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: services.length },
                        { name: 'Capacity', value: 10 - services.length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      <Cell fill="#8B5CF6" />
                      <Cell fill="rgba(255,255,255,0.05)" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-3xl font-display font-bold">{services.length}</div>
                  <div className="text-[8px] text-gray-500 uppercase tracking-widest">Active</div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="glass p-8 rounded-[32px] luxury-shadow h-[280px] flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Market Presence</div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'UK', active: 12, pending: 4 },
                    { name: 'EU', active: 8, pending: 15 },
                  ]}>
                    <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="active" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="pending" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-brand-purple" /> Active
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-white/10" /> Pending
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <FadeIn delay={0.4}>
              <h2 className="text-2xl font-display font-bold mb-6">Active Requests</h2>
            </FadeIn>
            {services.length === 0 ? (
              <FadeIn delay={0.5}>
                <div className="glass p-12 rounded-[32px] text-center border-dashed border-white/10">
                  <p className="text-gray-500">No active requests found. Start your first project today.</p>
                </div>
              </FadeIn>
            ) : (
              <div className="grid gap-4">
                {services.map((service, i) => (
                  <FadeIn key={service.id} delay={0.5 + (i * 0.05)}>
                    <motion.div 
                      whileHover={{ x: 10 }}
                      className="glass p-6 rounded-2xl flex items-center justify-between group hover:border-brand-purple/30 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-brand-purple/10 transition-colors">
                          {service.type === 'consultation' ? <MessageSquare className="w-6 h-6 text-brand-purple" /> : <ShieldCheck className="w-6 h-6 text-brand-purple" />}
                        </div>
                        <div>
                          <h3 className="font-bold tracking-tight">{service.data.productName || service.data.fullName || 'Consultation Request'}</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-widest">{service.type.replace('_', ' ')} • {service.createdAt?.toDate() ? new Date(service.createdAt.toDate()).toLocaleDateString() : 'Just now'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                            <span className="text-xs font-bold text-brand-purple uppercase tracking-widest">{service.status}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <FadeIn delay={0.6}>
              <div className="glass p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-purple" /> Support
                </h3>
                <p className="text-sm text-gray-400 mb-6">Need help with your registration? Our experts are available 24/7.</p>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all">
                  Open Ticket
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.7}>
              <div className="glass p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-purple" /> Documents
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm flex items-center justify-between">
                    <span>ID Verification</span>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm flex items-center justify-between">
                    <span>Proof of Address</span>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'analytics'>('requests');
  const [allServices, setAllServices] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) return;
    
    // Listen to services
    const qServices = query(collection(db, 'services'), orderBy('createdAt', 'desc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setAllServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listen to users
    const qUsers = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubServices();
      unsubUsers();
    };
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'services', id), { 
        status, 
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { 
        role: newRole,
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Failed to update user role", error);
    }
  };

  if (!isAdmin) return <Navigate to="/" />;

  const stats = [
    { label: 'Total Requests', value: allServices.length, icon: FileText, color: 'text-blue-400' },
    { label: 'Pending', value: allServices.filter(s => s.status === 'pending').length, icon: Activity, color: 'text-yellow-400' },
    { label: 'Completed', value: allServices.filter(s => s.status === 'completed').length, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Total Users', value: allUsers.length, icon: Users, color: 'text-purple-400' },
  ];

  const filteredServices = allServices.filter(s => 
    s.data?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.data?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Elite Command Center</h1>
            <p className="text-gray-500 font-light">Manage global operations and client requests with precision.</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {(['requests', 'users', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                  activeTab === tab ? "bg-brand-purple text-white luxury-shadow" : "text-gray-500 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-3xl border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-display font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search requests by name, email, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-brand-purple/50 outline-none transition-all"
                />
              </div>
              <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            <div className="glass rounded-[32px] overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Service Type</th>
                      <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Client</th>
                      <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Date</th>
                      <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Status</th>
                      <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredServices.map((s, i) => (
                      <motion.tr 
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-purple/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-brand-purple" />
                            </div>
                            <span className="font-bold capitalize">{s.type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-medium">{s.data?.fullName || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500 font-light">{s.data?.email || s.userId}</div>
                        </td>
                        <td className="p-6 text-sm text-gray-500">
                          {s.createdAt?.toDate().toLocaleDateString()}
                        </td>
                        <td className="p-6">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                            s.status === 'completed' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                            s.status === 'processing' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                            s.status === 'rejected' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          )}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <select 
                              value={s.status}
                              onChange={(e) => updateStatus(s.id, e.target.value)}
                              className="bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:border-brand-purple outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <button 
                              onClick={() => setSelectedService(s)}
                              className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                            >
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass rounded-[32px] overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">User</th>
                    <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Email</th>
                    <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Role</th>
                    <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Joined</th>
                    <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allUsers.map((u, i) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {u.displayName?.[0] || u.email?.[0] || '?'}
                          </div>
                          <span className="font-bold">{u.displayName || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-400 font-mono">{u.email}</td>
                      <td className="p-6">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                          u.role === 'admin' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-gray-500/10 text-gray-500 border border-white/5"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 text-sm text-gray-500">
                        {u.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <select 
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className="bg-brand-dark border border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:border-brand-purple outline-none"
                        >
                          <option value="client">Client</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass p-10 rounded-[40px] border border-white/5 min-h-[450px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Service Distribution</h3>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <PieChart className="w-4 h-4 text-brand-purple" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Consultation', value: allServices.filter(s => s.type === 'consultation').length },
                          { name: 'Business Setup', value: allServices.filter(s => s.type === 'business_setup').length },
                          { name: 'Product Reg', value: allServices.filter(s => s.type === 'product_reg').length },
                          { name: 'Branding', value: allServices.filter(s => s.type === 'branding').length },
                          { name: 'Growth', value: allServices.filter(s => s.type === 'growth').length },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {[
                          '#8B5CF6', // purple
                          '#3B82F6', // blue
                          '#10B981', // green
                          '#F59E0B', // yellow
                          '#EF4444', // red
                        ].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { name: 'Consultation', color: 'bg-brand-purple' },
                    { name: 'Business Setup', color: 'bg-blue-500' },
                    { name: 'Product Reg', color: 'bg-green-500' },
                    { name: 'Branding', color: 'bg-yellow-500' },
                    { name: 'Growth', color: 'bg-red-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} />
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-10 rounded-[40px] border border-white/5 min-h-[450px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Request Velocity</h3>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Pending', value: allServices.filter(s => s.status === 'pending').length },
                      { name: 'Processing', value: allServices.filter(s => s.status === 'processing').length },
                      { name: 'Completed', value: allServices.filter(s => s.status === 'completed').length },
                      { name: 'Rejected', value: allServices.filter(s => s.status === 'rejected').length },
                    ]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass p-10 rounded-[40px] border border-white/5 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">User Activity Trend</h3>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Jan', users: 12, active: 8 },
                      { name: 'Feb', users: 25, active: 18 },
                      { name: 'Mar', users: 45, active: 32 },
                      { name: 'Apr', users: allUsers.length, active: Math.floor(allUsers.length * 0.7) },
                    ]}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#userGradient)" />
                      <Area type="monotone" dataKey="active" stroke="#3B82F6" strokeWidth={2} fill="none" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass p-10 rounded-[40px] border border-white/5 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Operational Growth</h3>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Week 1', value: 400 },
                      { name: 'Week 2', value: 700 },
                      { name: 'Week 3', value: 1200 },
                      { name: 'Week 4', value: allServices.length * 150 },
                    ]}>
                      <defs>
                        <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="stepAfter" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#growthGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass p-12 rounded-[48px] border border-white/10 luxury-shadow overflow-hidden"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-brand-purple" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-bold capitalize">{selectedService.type.replace('_', ' ')}</h2>
                  <p className="text-gray-500 text-sm">Request ID: {selectedService.id}</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Client Name</label>
                    <p className="text-lg font-medium">{selectedService.data?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Email Address</label>
                    <p className="text-lg font-medium">{selectedService.data?.email || 'N/A'}</p>
                  </div>
                </div>

                {selectedService.data?.businessType && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Business Type</label>
                    <p className="text-lg font-medium">{selectedService.data.businessType}</p>
                  </div>
                )}

                {selectedService.data?.services && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Requested Services</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedService.data.services.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedService.data?.message && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Client Message</label>
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-sm font-light leading-relaxed text-gray-300">
                      {selectedService.data.message}
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Current Status:</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                      selectedService.status === 'completed' ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    )}>
                      {selectedService.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:scale-105 transition-all luxury-shadow"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Legal Pages ---

const LegalLayout = ({ title, lastUpdated, children }: { title: string, lastUpdated: string, children: React.ReactNode }) => {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">{title}</h1>
            <div className="flex items-center gap-4 text-gray-500 text-sm font-mono uppercase tracking-widest">
              <span>Last Updated: {lastUpdated}</span>
              <div className="w-1 h-1 rounded-full bg-brand-purple" />
              <span>Nexus Elite Compliance</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="glass p-12 md:p-20 rounded-[48px] border border-white/5 prose prose-invert prose-brand max-w-none">
            {children}
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" lastUpdated="April 10, 2026">
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          At Nexus Elite, we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our premium concierge services.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          We collect information that you provide directly to us, including your name, email address, business details, and any documentation required for compliance and registration services.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
        <ul className="list-disc list-inside text-gray-400 space-y-2 font-light">
          <li>To provide and maintain our elite concierge services.</li>
          <li>To process your business formation and product registration requests.</li>
          <li>To communicate with you regarding your account and service updates.</li>
          <li>To ensure compliance with UK and EU regulatory requirements.</li>
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          We implement industry-leading security measures, including end-to-end encryption and secure Firestore storage, to protect your data from unauthorized access or disclosure.
        </p>
      </div>
    </section>
  </LegalLayout>
);

const TermsOfService = () => (
  <LegalLayout title="Terms of Service" lastUpdated="April 10, 2026">
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          By accessing or using the Nexus Elite platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          Nexus Elite provides high-end business consulting, formation, and compliance services. We act as your professional concierge for navigating UK and EU regulatory landscapes.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">3. Client Responsibilities</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          Clients are responsible for providing accurate and complete information required for service fulfillment. Any delays caused by inaccurate data are the responsibility of the client.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">4. Limitation of Liability</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          Nexus Elite shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our services, to the maximum extent permitted by law.
        </p>
      </div>
    </section>
  </LegalLayout>
);

const ComplianceDisclosure = () => (
  <LegalLayout title="Compliance Disclosure" lastUpdated="April 10, 2026">
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Regulatory Overview</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          Nexus Elite operates in strict accordance with UK Companies House and EU regulatory bodies. Our services are designed to ensure your business meets all legal requirements for operation and product distribution.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Anti-Money Laundering (AML)</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          We maintain rigorous AML and Know Your Customer (KYC) procedures. All clients must undergo identity verification before business formation services can be finalized.
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Professional Advice</h2>
        <p className="text-gray-400 leading-relaxed font-light">
          While we provide expert guidance, our services do not constitute legal or tax advice. We recommend consulting with qualified legal and financial professionals for specific corporate structuring needs.
        </p>
      </div>
    </section>
  </LegalLayout>
);

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
          <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-purple selection:text-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/consultation" element={<ConsultationWizard />} />
              <Route path="/product-registration" element={<ProductWizardPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/compliance" element={<ComplianceDisclosure />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            
            {/* Footer */}
            <footer className="py-24 px-6 border-t border-white/5">
              <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                <div className="col-span-2">
                  <Link to="/" className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center luxury-shadow">
                      <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                    <span className="text-lg font-display font-bold">NEXUS ELITE</span>
                  </Link>
                  <p className="text-gray-400 max-w-sm font-light">
                    The premier concierge platform for UK & EU business formation and compliance. 
                    Empowering the world's most ambitious entrepreneurs.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                    <li><Link to="/consultation" className="hover:text-white transition-colors">Consultation</Link></li>
                    <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
                  <ul className="space-y-4 text-sm text-gray-500">
                    <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                    <li><Link to="/compliance" className="hover:text-white transition-colors">Compliance Disclosure</Link></li>
                  </ul>
                </div>
              </div>
              <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                © 2026 Nexus Elite | UK & EU Compliance. All rights reserved.
              </div>
            </footer>
            <ChatBot />
          </div>
        </Router>
      </AuthProvider>
  );
}
