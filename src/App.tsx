/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Activity, 
  User, 
  Phone as PhoneIcon, 
  Calendar as CalendarIcon, 
  Clock as ClockIcon, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Menu, 
  X,
  Dna,
  ShieldAlert,
  Thermometer,
  Layers,
  LogOut,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Stethoscope,
  LayoutDashboard,
  Users,
  Settings,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  orderBy
} from 'firebase/firestore';

// --- Constants & Types ---

const DOCTORS = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Chief Cardiologist",
    exp: "15 Years",
    image: "https://picsum.photos/seed/doc1/400/500",
    specialty: "Cardiology"
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    role: "Senior Pediatrician",
    exp: "12 Years",
    image: "https://picsum.photos/seed/doc2/400/500",
    specialty: "Pediatrics"
  },
  {
    id: 3,
    name: "Dr. Elena Rodriguez",
    role: "Orthopedic Surgeon",
    exp: "10 Years",
    image: "https://picsum.photos/seed/doc3/400/500",
    specialty: "Orthopedics"
  },
  {
    id: 4,
    name: "Dr. Michael Park",
    role: "Neurologist",
    exp: "8 Years",
    image: "https://picsum.photos/seed/doc4/400/500",
    specialty: "Neurology"
  }
];

const SURGERIES = [
  {
    title: "Cardiovascular Surgery",
    desc: "Advanced heart bypass and arterial treatments using minimally invasive techniques.",
    icon: HeartPulse,
    color: "bg-red-50 text-red-600"
  },
  {
    title: "Robotic Orthopedic",
    desc: "Precision joint replacement and ligament repair using state-of-the-art robotic assistance.",
    icon: Activity,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Neurosurgery",
    desc: "Specialized procedures for brain and spinal cord disorders with high-precision imaging.",
    icon: Stethoscope,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "General Surgery",
    desc: "Comprehensive abdominal and soft tissue procedures with focus on rapid recovery.",
    icon: Layers,
    color: "bg-teal-50 text-teal-600"
  }
];

const DEPARTMENTS = [
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "General Medicine",
  "Emergency Care",
  "Surgical Department"
];

const SURGERY_TYPES = [
  "Not Applicable",
  "Heart Bypass",
  "Knee Replacement",
  "Hip Arthroscopy",
  "Brain Tumor Removal",
  "Spinal Fusion",
  "Appendectomy",
  "Laparoscopic Cholecystectomy",
  "Cataract Surgery"
];

// --- Components ---

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }: { isOpen: boolean, onClose: () => void, initialMode?: 'signin' | 'signup' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          fullName,
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 md:p-10 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-medical-blue mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Join Resonance'}
              </h3>
              <p className="text-slate-500 text-sm">
                {mode === 'signin' ? 'Enter your credentials to access your account' : 'Start your health journey with us today'}
              </p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-6 font-medium border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full pl-12 p-3 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="email" 
                    placeholder="john@example.com" 
                    className="w-full pl-12 p-3 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-12 p-3 bg-slate-50 rounded-2xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-medical-blue text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="ml-2 font-bold text-teal-600 hover:underline"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ user, isAdmin, currentView, onToggleView, onAuthClick }: { 
  user: FirebaseUser | null, 
  isAdmin: boolean,
  currentView: 'client' | 'admin',
  onToggleView: (view: 'client' | 'admin') => void,
  onAuthClick: () => void 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Doctors', href: '#doctors' },
    { name: 'Surgeries', href: '#surgeries' },
    { name: 'Booking', href: '#booking' },
  ];

  return (
    <nav className="sticky top-0 md:top-6 w-full z-50 px-0 md:px-6 max-w-7xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md rounded-none md:rounded-2xl border-b md:border border-slate-200 shadow-sm px-6 md:px-8 py-4 flex justify-between items-center transition-all">
        <a href="#home" onClick={() => onToggleView('client')} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <HeartPulse size={20} />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-medical-blue uppercase">
            Resonance <span className="text-teal-600">Memorial</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {currentView === 'client' ? (
            <>
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-sm font-bold text-slate-500 hover:text-medical-blue transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-teal-600 hover:after:w-full"
                >
                  {link.name}
                </a>
              ))}
              {isAdmin && (
                <button 
                  onClick={() => onToggleView('admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-bold hover:bg-teal-100 transition-all border border-teal-100 text-xs"
                >
                  <LayoutDashboard size={14} />
                  Admin
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={() => onToggleView('client')}
              className="flex items-center gap-2 px-4 py-2 bg-medical-blue text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-xs"
            >
              <Users size={14} />
              Website
            </button>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                </button>
             </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => onToggleView(currentView === 'client' ? 'admin' : 'client')} className="p-2 text-teal-600 bg-teal-50 rounded-lg">
              <LayoutDashboard size={20} />
            </button>
          )}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-medical-blue"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:hidden z-[60]"
            >
              <div className="flex flex-col gap-4">
                {currentView === 'client' ? navLinks.map((link) => (
                  <a 
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-slate-700 py-2 border-b border-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )) : (
                  <button onClick={() => { onToggleView('client'); setIsMenuOpen(false); }} className="font-bold text-medical-blue flex items-center gap-2 py-2">
                    <Users size={18} /> Visit Website
                  </button>
                )}
                {user ? (
                   <button onClick={() => { signOut(auth); setIsMenuOpen(false); }} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold">
                     Sign Out
                   </button>
                ) : (
                  <button onClick={() => { onAuthClick(); setIsMenuOpen(false); }} className="w-full py-3 bg-medical-blue text-white rounded-xl font-bold">
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    fullName: '',
    contact: '',
    department: '',
    surgeryType: 'Not Applicable',
    date: '',
    time: ''
  });

  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdminBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        userId: 'admin-entry',
        age: 0,
        status: 'confirmed',
        createdAt: serverTimestamp()
      });
      setShowAddForm(false);
      setNewBooking({
        fullName: '',
        contact: '',
        department: '',
        surgeryType: 'Not Applicable',
        date: '',
        time: ''
      });
    } catch (err) {
      alert("Failed to create booking");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm("Delete this booking record?")) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (err) {
        alert("Failed to delete booking");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="animate-spin text-teal-600" size={32} />
      <p className="text-slate-500 font-bold">Loading system data...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-20 px-4 md:px-0">
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-medical-blue">Command Center</h2>
          <p className="text-xs font-medium text-slate-400">Manage all hospital operations</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors"
        >
          {showAddForm ? <X size={16} /> : <Users size={16} />}
          {showAddForm ? 'Close Form' : 'Register Patient'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <form onSubmit={handleAdminBooking} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Patient Name</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Full name" value={newBooking.fullName} onChange={e => setNewBooking({...newBooking, fullName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder="Phone or Email" value={newBooking.contact} onChange={e => setNewBooking({...newBooking, contact: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dept</label>
                  <select required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" value={newBooking.department} onChange={e => setNewBooking({...newBooking, department: e.target.value})}>
                    <option value="">Select Dept</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</label>
                  <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</label>
                  <input required type="time" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full py-3 bg-medical-blue text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    Add Appointment
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Appointments', value: bookings.length, icon: CalendarCheck, color: 'text-medical-blue', bg: 'bg-medical-blue/5' },
          { label: 'Pending Task', value: bookings.filter(b => b.status === 'pending').length, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-6 bg-slate-50/50 border-b border-slate-50">
          <h3 className="font-bold text-medical-blue">Global Booking Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-medical-blue">{booking.fullName}</div>
                    <div className="text-xs text-slate-400">{booking.contact}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-600">{booking.department}</div>
                    <div className="text-[10px] text-teal-600 font-bold uppercase">{booking.surgeryType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-500">{booking.date}</div>
                    <div className="text-xs text-slate-400">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      booking.status === 'confirmed' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end">
                      {booking.status === 'pending' && (
                        <button onClick={() => updateStatus(booking.id, 'confirmed')} className="p-1.5 hover:bg-teal-50 text-teal-600 rounded-lg">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteBooking(booking.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ appointment, onClose }: { appointment: any, onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-teal-600" />
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-medical-blue mb-2">Booking Confirmed!</h3>
        <p className="text-slate-600 mb-6">
          Dear <span className="font-semibold">{appointment.fullName}</span>, your appointment for <span className="font-semibold">{appointment.department}</span> has been scheduled.
        </p>
        
        <div className="w-full bg-slate-50 rounded-2xl p-4 text-left mb-8 space-y-2 border border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Date:</span>
            <span className="font-medium">{appointment.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Time:</span>
            <span className="font-medium">{appointment.time}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Reference:</span>
            <span className="font-mono font-medium text-teal-accent">#RMH-{Math.floor(Math.random() * 89999 + 10000)}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full btn-primary"
        >
          Done
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    contact: '',
    department: '',
    surgeryType: 'Not Applicable',
    date: '',
    time: '',
    reason: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Designate specific email as admin for immediate access
        if (u.email === "kshitiztiwari374@gmail.com") {
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", u.uid));
            setIsAdmin(userDoc.data()?.isAdmin || false);
          } catch (err) {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
        setView('client');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsBookingLoading(true);
    try {
      const bookingData = {
        ...formData,
        userId: user.uid,
        age: Number(formData.age),
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      setSubmittedData(formData);
      setShowSuccess(true);
      setFormData({
        fullName: '',
        age: '',
        contact: '',
        department: '',
        surgeryType: 'Not Applicable',
        date: '',
        time: '',
        reason: ''
      });
    } catch (err) {
      console.error("Error booking appointment", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col gap-4 md:gap-6 p-4 md:p-6 font-sans">
      <Navbar 
        user={user} 
        isAdmin={isAdmin}
        currentView={view}
        onToggleView={setView}
        onAuthClick={() => setIsAuthModalOpen(true)} 
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {view === 'admin' && isAdmin ? (
        <AdminDashboard />
      ) : (
        <main className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 md:gap-6 pb-12">
          
          {/* Hero Section */}
          <motion.section 
            id="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-12 lg:col-span-8 bg-medical-blue rounded-[24px] md:rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center min-h-[350px] md:min-h-[400px]"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6">Patient-First Care</span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-2xl">
                Healthcare Reimagined for <br/><span className="text-teal-400">Modern Living.</span>
              </h1>
              <p className="text-slate-400 max-w-lg mb-8 text-sm md:text-lg">
                Combining clinical excellence with the latest robotic precision technology to provide world-class memorial care.
              </p>
              <a href="#booking" className="btn-teal inline-block text-sm md:text-base">
                Book Appointment Now
              </a>
            </div>
          </motion.section>

        {/* Surgery Services (Small Bento Card) */}
        <motion.section 
          id="surgeries"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bento-card p-6 md:p-8 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-teal-600/10 text-teal-600 rounded flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-medical-blue">Surgical Excellence</h3>
          </div>
          <div className="flex flex-col gap-3 md:gap-4 flex-1">
            {SURGERIES.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100 group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-teal-600">
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-medical-blue">{s.title.split(' ')[0]}</p>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">Advanced Procedures</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* About Us Bento Card */}
        <motion.section 
          id="about"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bento-card p-6 md:p-8 bg-white border-slate-200"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-medical-blue/10 text-medical-blue rounded flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-medical-blue">About Resonance</h3>
          </div>
          <div className="space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              Founded in 1998, Resonance Memorial Hospital has been at the forefront of medical innovation for over 25 years. We provide specialized care across multiple disciplines, hosting over 150 award-winning medical doctors.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Our facilities are equipped with the latest robotic surgical systems (Da Vinci Xi) and high-resolution MRI centers. We are consistently ranked among the top 5 hospitals in the region for cardiovascular and neurosurgical primary outcomes.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xl font-bold text-teal-600">25+</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Years of Care</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xl font-bold text-teal-600">50k+</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Happy Patients</p>
              </div>
            </div>
            <p className="text-slate-500 text-xs italic mt-4">
              "Healing the community through empathy, technical precision, and unwavering dedication to life."
            </p>
          </div>
        </motion.section>

        {/* Specialists Directory (Large Bento Card) */}
        <motion.section 
          id="doctors"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 lg:col-span-8 bento-card p-8 md:p-10"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-10 gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-medical-blue mb-2">Our Specialists</h3>
              <p className="text-slate-500 text-sm md:text-base">World-renowned medical experts in Resonance</p>
            </div>
            <button className="text-teal-600 font-bold flex items-center gap-1 hover:gap-2 transition-all text-sm md:text-base">
              View All <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
            {DOCTORS.map((doc) => (
              <div key={doc.id} className="flex gap-4 p-4 md:p-5 rounded-[24px] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] overflow-hidden shrink-0 border-4 border-white shadow-sm">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-bold text-base md:text-lg leading-tight text-medical-blue">{doc.name}</p>
                  <p className="text-teal-600 text-xs md:text-sm font-semibold mb-2">{doc.specialty}</p>
                  <span className="text-[9px] md:text-[10px] py-1 px-3 bg-white font-bold text-slate-500 rounded-full border border-slate-200 w-fit uppercase tracking-wider">{doc.exp} Experience</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Booking System (Tall Bento Card) */}
        <motion.section 
          id="booking"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bg-teal-50 rounded-[24px] md:rounded-[32px] p-8 border border-teal-100 flex flex-col"
        >
          <h3 className="text-xl md:text-2xl font-bold text-medical-blue mb-2">Instant Booking</h3>
          <p className="text-xs md:text-sm text-teal-700/70 mb-8 font-medium">Secure your preferred slot instantly.</p>
          
          <form onSubmit={handleBooking} className="flex flex-col gap-4 md:gap-5 flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-teal-800 ml-1">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="John Doe" 
                className="w-full p-4 bg-white rounded-2xl border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm placeholder:text-slate-300" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-800 ml-1">Age</label>
                <input 
                  required
                  type="number" 
                  placeholder="30" 
                  className="w-full p-4 bg-white rounded-2xl border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm placeholder:text-slate-300"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-800 ml-1">Dept</label>
                <select 
                  required
                  className="w-full p-4 bg-white rounded-2xl border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm appearance-none cursor-pointer"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="absolute right-4 bottom-4 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-800 ml-1">Preferred Date</label>
                <input 
                  required
                  type="date" 
                  className="w-full p-4 bg-white rounded-2xl border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm cursor-pointer" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-teal-800 ml-1">Surgery Type</label>
                <select 
                  required
                  className="w-full p-4 bg-white rounded-2xl border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm appearance-none cursor-pointer"
                  value={formData.surgeryType}
                  onChange={(e) => setFormData({...formData, surgeryType: e.target.value})}
                >
                  {SURGERY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="absolute right-4 bottom-4 pointer-events-none text-slate-400">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-teal-800 ml-1">Reason (Optional)</label>
              <textarea 
                rows={2} 
                placeholder="Brief checkup..." 
                className="w-full p-4 bg-white rounded-2xl border border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-600/50 text-sm resize-none placeholder:text-slate-300"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={isBookingLoading}
              className="mt-auto w-full py-4 md:py-5 bg-teal-600 text-white rounded-[24px] font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/30 active:scale-95 text-base md:text-lg flex items-center justify-center gap-2"
            >
              {isBookingLoading && <Loader2 size={20} className="animate-spin" />}
              {user ? 'Confirm Appointment' : 'Sign In to Book'}
            </button>
          </form>
        </motion.section>

      </main>
      )}

      {view === 'client' && (
      <footer className="max-w-7xl mx-auto w-full bg-white rounded-[24px] md:rounded-3xl border border-slate-200 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 mb-8 md:mb-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center text-white">
            <HeartPulse size={20} />
          </div>
          <span className="font-bold text-medical-blue uppercase tracking-tight">Resonance <span className="text-teal-600">Memorial</span></span>
        </div>
        <p className="text-slate-500 text-[10px] md:text-sm font-medium text-center md:text-left">© 2026 Resonance Memorial Hospital. All Rights Reserved.</p>
        <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-bold text-slate-400">
          <a href="#" className="hover:text-medical-blue transition-colors">Privacy</a>
          <a href="#" className="hover:text-medical-blue transition-colors">Terms</a>
          <a href="#" className="hover:text-medical-blue transition-colors">Careers</a>
        </div>
      </footer>
      )}

      <AnimatePresence>
        {showSuccess && (
          <SuccessModal 
            appointment={submittedData} 
            onClose={() => setShowSuccess(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
