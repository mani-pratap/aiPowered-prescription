import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Activity,
  ShieldCheck,
  Pill,
  Stethoscope,
  ChevronRight,
  Star,
} from "lucide-react";
import shopService from "../services/shopService";
import cartService from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const LandingPage = () => {
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await shopService.getShopMedicines("?limit=3");
        setFeaturedMedicines(data.medicines || []);
      } catch (err) {
        console.error("Failed to load featured medicines", err);
      }
    };
    loadFeatured();
  }, []);

  const handlePreviewAdd = async (medicineId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await cartService.addToCart(medicineId, 1);
      toast.success("Added to cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Failed to add to cart");
    }
  };
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950">
      {/* SaaS Grade Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in-up hover:bg-indigo-500/20 transition-colors cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span className="text-sm font-semibold text-indigo-300">
            Prescripto AI 2.0 is now live
          </span>
          <ChevronRight className="w-4 h-4 text-indigo-400" />
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
          The Intelligence Layer for <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Medical Health
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed font-medium">
          Transform confusing handwritten prescriptions into clear, actionable
          insights. Cut healthcare costs with generic alternatives, track your
          chronic conditions, and never miss a dose again.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-indigo-600 border border-transparent rounded-2xl hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900"
          >
            Get Started for Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-300 transition-all duration-300 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 focus:ring-offset-slate-900"
          >
            Sign in to Dashboard
          </Link>
        </div>
      </div>

      {/* Store Preview Section - added */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Store Preview</h2>
          <p className="text-sm text-slate-400">
            Quick picks from our OTC catalog
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {featuredMedicines.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400 md:col-span-3">
              Loading medicines...
            </div>
          ) : (
            featuredMedicines.map((m) => (
              <div
                key={m._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md">
                    {m.category || "General"}
                  </span>
                  {m.prescriptionRequired && (
                    <span className="text-xs text-amber-400">Rx</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                  {m.medicineName}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {m.composition}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-black text-white">
                      ₹{m.price}
                    </div>
                    {m.mrp > m.price && (
                      <div className="text-sm text-slate-500 line-through">
                        ₹{m.mrp}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreviewAdd(m._id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold"
          >
            View more in Store
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Trust Badge / Metrics Section */}
      <div className="w-full border-y border-white/5 bg-white/[0.02] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            <div>
              <div className="text-3xl font-black text-white mb-1">99%</div>
              <div className="text-sm font-medium text-slate-400">
                OCR Accuracy
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">10k+</div>
              <div className="text-sm font-medium text-slate-400">
                Medicines in DB
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">~60%</div>
              <div className="text-sm font-medium text-slate-400">
                Average Savings
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-white mb-1">24/7</div>
              <div className="text-sm font-medium text-slate-400">
                AI Health Assistant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Everything you need to manage your healthcare.
          </h2>
          <p className="text-lg text-slate-400">
            Powerful features designed to put you back in control of your
            medical journey, from decoding doctor's notes to managing chronic
            diseases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="w-6 h-6 text-indigo-400" />,
              title: "AI Vision Analysis",
              desc: "Snap a photo of any handwritten prescription. Our multi-modal AI extracts doctor info, medicine dosage, and frequency with incredible accuracy.",
            },
            {
              icon: <Pill className="w-6 h-6 text-purple-400" />,
              title: "Generic Replacements",
              desc: "Stop overpaying for branded medicines. Our engine instantly finds 100% chemically identical generic alternatives to save you money.",
            },
            {
              icon: <Activity className="w-6 h-6 text-pink-400" />,
              title: "Disease Prediction",
              desc: "Based on the prescribed medicines, our AI safely predicts your likely condition and offers personalized dietary and lifestyle recommendations.",
            },
            {
              icon: <Stethoscope className="w-6 h-6 text-emerald-400" />,
              title: "Multilingual Explanations",
              desc: "Medical jargon is hard. We explain what each medicine does, side effects, and precautions in simple language across 4 regional languages.",
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
              title: "Safe OTC Store",
              desc: "Browse our built-in e-commerce store for Over-The-Counter medicines. We employ strict safety filters to block sensitive medications automatically.",
            },
            {
              icon: <Star className="w-6 h-6 text-amber-400" />,
              title: "Chronic Care Reminders",
              desc: "Set up profiles as a Regular Medicine User. We will track your active medicines and alert you when you need to refill your prescription.",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-800/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-transform shadow-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Stories / Testimonials */}
      <div className="w-full bg-indigo-900/10 border-t border-white/5 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Loved by patients and caregivers.
            </h2>
            <p className="text-slate-400 text-lg">
              Real stories from people who took control of their healthcare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl relative">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-slate-300 font-medium mb-8 leading-relaxed text-lg">
                "My grandfather takes 8 different medicines a day. I used to
                struggle reading his prescriptions. Now, I just take a photo and
                the AI tells me exactly what each medicine is for and when to
                give it."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div>
                  <div className="text-white font-bold">Arjun Sharma</div>
                  <div className="text-slate-400 text-sm">Family Caregiver</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl relative transform md:-translate-y-4">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-slate-300 font-medium mb-8 leading-relaxed text-lg">
                "I was spending almost ₹4000 a month on my diabetes and
                hypertension medication. The generic medicine finder showed me
                identical alternatives that brought my bill down to ₹1200. Life
                changing."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <div className="text-white font-bold">Sneha Patel</div>
                  <div className="text-slate-400 text-sm">
                    Regular Medicine User
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl relative">
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-slate-300 font-medium mb-8 leading-relaxed text-lg">
                "The personalized diet recommendations are amazing. The AI
                recognized my thyroid medication and automatically gave me a
                list of foods to avoid and recommended a daily routine. It's
                like having a digital doctor."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  R
                </div>
                <div>
                  <div className="text-white font-bold">Rahul Verma</div>
                  <div className="text-slate-400 text-sm">IT Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA - hide for signed-in users */}
      {!user && (
        <div className="w-full py-32 text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to decode your prescription?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join thousands of users making smarter healthcare decisions today.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 focus:outline-none"
          >
            Create your free account
          </Link>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
