"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Award,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Trophy,
  Flame,
  UserCheck,
  Target,
  Cake,
  Star,
  CheckCircle2,
  Calendar,
  Phone,
  X,
  Save,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Check,
  Mail,
  MailCheck,
  MailX,
  Edit3,
} from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { Country, State, City } from "country-state-city";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  completeUserProfileMissionAction,
  addUserAddressAction,
  deleteUserAddressAction,
  setDefaultUserAddressAction,
  updateUserMarketingToggleAction,
} from "../actions";

interface TierItem {
  id: string;
  name: string;
  minPoints: number;
  badgeImageUrl?: string | null;
  perks?: string | null;
}

interface RuleItem {
  id: string;
  actionType: string;
  pointsReward: number;
  isActive: boolean;
}

export interface AddressItem {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CustomerDashboardProps {
  userName: string;
  userEmail: string;
  userId: string;
  loyaltyPoints: number;
  userOrdersCount: number;
  birthdate?: string | Date | null;
  phone?: string | null;
  acceptsMarketing?: boolean;
  isProfileCompleted: boolean;
  addresses?: AddressItem[];
  tiers: TierItem[];
  rules: RuleItem[];
}

export default function CustomerDashboardClient({
  userName,
  userEmail,
  userId,
  loyaltyPoints,
  userOrdersCount,
  birthdate,
  phone,
  acceptsMarketing = false,
  isProfileCompleted,
  addresses = [],
  tiers,
  rules,
}: CustomerDashboardProps) {
  const [isPending, startTransition] = useTransition();

  // Estados Perfil & Modales
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [birthdateInput, setBirthdateInput] = useState(
    birthdate ? new Date(birthdate).toISOString().split("T")[0] : ""
  );
  const [phoneInput, setPhoneInput] = useState(phone || "");
  const [acceptsMarketingInput, setAcceptsMarketingInput] = useState(acceptsMarketing);
  const [missionMessage, setMissionMessage] = useState<string | null>(null);

  // Estados Libreta de Direcciones (Paso 2)
  const [addressesList, setAddressesList] = useState<AddressItem[]>(addresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Formulario nueva dirección con selectores en cascada (country-state-city)
  const [selectedCountryCode, setSelectedCountryCode] = useState("PE");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [streetInput, setStreetInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [postalCodeInput, setPostalCodeInput] = useState("");
  const [countryInput, setCountryInput] = useState("Perú");
  const [isDefaultInput, setIsDefaultInput] = useState(true);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [isTogglingMarketing, setIsTogglingMarketing] = useState(false);

  // Listas geográficas dinámicas
  const countriesList = Country.getAllCountries().sort((a, b) => {
    if (a.isoCode === "PE") return -1;
    if (b.isoCode === "PE") return 1;
    return a.name.localeCompare(b.name);
  });

  const statesList = selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  const citiesList = (selectedCountryCode && selectedStateCode)
    ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
    : [];

  // Dirección Predeterminada Actual
  const defaultAddress = addressesList.find((a) => a.isDefault) || addressesList[0] || null;

  // 1. Determinar el Nivel Actual Dinámico desde Neon DB
  let currentTier: TierItem | null = null;
  let nextTier: TierItem | null = null;

  if (tiers.length > 0) {
    const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
    for (let i = 0; i < sortedTiers.length; i++) {
      if (loyaltyPoints >= sortedTiers[i].minPoints) {
        currentTier = sortedTiers[i];
      } else {
        nextTier = sortedTiers[i];
        break;
      }
    }
    if (!currentTier) currentTier = sortedTiers[0];
  }

  const rankTitle = currentTier ? currentTier.name : "Nivel Contender 🥉";
  const nextRankPoints = nextTier ? nextTier.minPoints : currentTier ? currentTier.minPoints : 1000;
  const currentMinPoints = currentTier ? currentTier.minPoints : 0;
  const ptsNeeded = nextTier ? Math.max(0, nextTier.minPoints - loyaltyPoints) : 0;

  const rankProgress = nextTier
    ? Math.min(100, Math.max(0, ((loyaltyPoints - currentMinPoints) / (nextTier.minPoints - currentMinPoints)) * 100))
    : 100;

  // 2. Misión de Perfil Completo
  const profileRule = rules.find((r) => r.actionType === "PROFILE_COMPLETION" && r.isActive);

  const handleCompleteProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthdateInput) {
      alert("Por favor ingresa tu fecha de nacimiento.");
      return;
    }

    startTransition(async () => {
      const res = await completeUserProfileMissionAction(
        userId,
        birthdateInput,
        phoneInput,
        acceptsMarketingInput
      );
      if (res.success) {
        setMissionMessage(res.message || "¡Misión completada!");
        setShowProfileModal(false);
      } else {
        alert(res.error || "Ocurrió un error al guardar.");
      }
    });
  };

  // Toggle rápido de Marketing
  const handleToggleMarketing = async () => {
    setIsTogglingMarketing(true);
    const nextVal = !acceptsMarketingInput;
    setAcceptsMarketingInput(nextVal);

    const res = await updateUserMarketingToggleAction(userId, nextVal);
    if (!res.success) {
      alert(res.error || "Error al actualizar preferencias.");
      setAcceptsMarketingInput(!nextVal);
    }
    setIsTogglingMarketing(false);
  };

  // CRUD Direcciones Handlers
  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetInput.trim() || !cityInput.trim() || !stateInput.trim()) {
      alert("Por favor completa los campos obligatorios de la dirección.");
      return;
    }

    setIsSubmittingAddress(true);

    const res = await addUserAddressAction(userId, {
      street: streetInput,
      city: cityInput,
      state: stateInput,
      postalCode: postalCodeInput,
      country: countryInput,
      isDefault: isDefaultInput,
    });

    if (res.success && res.address) {
      const newAddr: AddressItem = res.address;
      if (newAddr.isDefault) {
        setAddressesList((prev) =>
          prev.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
        );
      } else {
        setAddressesList((prev) => [...prev, newAddr]);
      }
      setStreetInput("");
      setCityInput("");
      setStateInput("");
      setPostalCodeInput("");
      setShowAddForm(false);
    } else {
      alert(res.error || "Error al guardar la dirección.");
    }

    setIsSubmittingAddress(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta dirección?")) return;

    const previous = [...addressesList];
    setAddressesList((prev) => prev.filter((a) => a.id !== id));

    const res = await deleteUserAddressAction(id, userId);
    if (!res.success) {
      alert(res.error || "Error al eliminar dirección.");
      setAddressesList(previous);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const previous = [...addressesList];
    setAddressesList((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );

    const res = await setDefaultUserAddressAction(id, userId);
    if (!res.success) {
      alert(res.error || "Error al actualizar dirección predeterminada.");
      setAddressesList(previous);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-body text-white">
      {/* Header del Cliente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-surface rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4">
          {currentTier?.badgeImageUrl ? (
            <img
              src={currentTier.badgeImageUrl}
              alt={rankTitle}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-pink shadow-lg shadow-accent-pink/20 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center font-extrabold text-2xl uppercase">
              {userName.substring(0, 2)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest">
                JUGADOR TCG
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-accent-pink/40 text-accent-pink bg-accent-pink/10 font-bold">
                {rankTitle}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white mt-0.5">
              {userName}
            </h1>
            <span className="text-xs text-neutral-400 font-mono">{userEmail}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SignOutButton />
        </div>
      </div>

      {/* Tarjetas de Estadísticas, Compras, Libreta de Direcciones & Beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1: Puntos de Fidelidad & Rango */}
        <div className="p-6 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 rounded-2xl border border-accent-pink/40 shadow-xl relative overflow-hidden space-y-3">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-accent-pink/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-pink uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> GOSU® LOYALTY
            </span>
            <Award className="w-5 h-5 text-accent-pink" />
          </div>

          <div>
            <span className="text-3xl font-black text-white font-mono block">
              {loyaltyPoints} <span className="text-xs text-neutral-400 font-normal">pts</span>
            </span>
            <span className="text-[11px] text-neutral-300 block font-semibold mt-0.5">
              = S/. {(loyaltyPoints / 40).toFixed(2)} PEN (40 Pts = S/. 1)
            </span>
          </div>

          {/* Barra de Progreso a Siguiente Rango */}
          <div className="pt-2 border-t border-neutral-800 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>Siguiente Rango</span>
              <span>{nextTier ? `Faltan ${ptsNeeded} pts` : "¡Nivel Máximo!"}</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan via-purple-500 to-accent-pink transition-all duration-500"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Mis Compras */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
              MIS COMPRAS
            </span>
            <ShoppingBag className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white font-mono block">
              {userOrdersCount} {userOrdersCount === 1 ? "Pedido" : "Pedidos"}
            </span>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-xs text-accent-cyan font-bold hover:underline mt-2"
            >
              <span>Ver historial</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tarjeta 3: Libreta de Direcciones (Paso 2) */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-purple-400" /> DIRECCIONES
            </span>
            {defaultAddress && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Predeterminada
              </span>
            )}
          </div>

          <div>
            {defaultAddress ? (
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-white truncate" title={defaultAddress.street}>
                  {defaultAddress.street}
                </p>
                <p className="text-neutral-400 text-[11px] truncate">
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                </p>
                <p className="text-neutral-500 text-[10px] font-mono">{defaultAddress.country}</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">No has registrado una dirección predeterminada.</p>
            )}
          </div>

          <button
            onClick={() => setShowAddressModal(true)}
            className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
          >
            <span>Gestionar Direcciones ({addressesList.length})</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* Tarjeta 4: Beneficios & Suscripción Marketing (Paso 3) */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
              MARKETING & NOVEDADES
            </span>
            <Mail className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <span className="text-xs text-neutral-300 block font-semibold">
              Drops Exclusivos & Promociones
            </span>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              Recibe avisos antes que nadie sobre repocisión de stock y boosters.
            </p>
          </div>

          <button
            onClick={handleToggleMarketing}
            disabled={isTogglingMarketing}
            className={`w-full py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 border ${
              acceptsMarketingInput
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {isTogglingMarketing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : acceptsMarketingInput ? (
              <>
                <MailCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Suscrito a Novedades ✓</span>
              </>
            ) : (
              <>
                <MailX className="w-3.5 h-3.5 text-neutral-500" />
                <span>Activar Suscripción</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECCIÓN INTERACTIVA: MISIONES DISPONIBLES (Smile.io Style) */}
      <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Misiones Disponibles & Formas de Ganar Puntos</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Completa misiones activas para subir de nivel rápidamente y acumular descuentos.
            </p>
          </div>

          {missionMessage && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold font-mono">
              {missionMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Misión 1: Bono de Registro */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Bono de Bienvenida</span>
                <span className="text-[11px] text-neutral-400">Otorgado al crear tu cuenta.</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completada
            </span>
          </div>

          {/* Misión 2: Perfil Completo (Interactive Action) */}
          {profileRule && (
            <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Completa tu Perfil</span>
                  <span className="text-[11px] text-neutral-400">
                    Gana +{profileRule.pointsReward} pts ingresando tu fecha de nacimiento.
                  </span>
                </div>
              </div>

              {isProfileCompleted ? (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                </span>
              ) : (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Completa y gana {profileRule.pointsReward} pts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Misión 3: Compras */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-cyan/10 rounded-xl text-accent-cyan">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Acumulación por Compras</span>
                <span className="text-[11px] text-neutral-400">Gana 1 punto por cada S/. 1 / $1 gastado.</span>
              </div>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Comprar Ahora
            </Link>
          </div>

          {/* Misión 4: Cumpleaños */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Regalo de Cumpleaños</span>
                <span className="text-[11px] text-neutral-400">
                  {birthdate ? `Registrado: ${new Date(birthdate).toLocaleDateString()}` : "Regala tu fecha de nacimiento."}
                </span>
              </div>
            </div>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-mono font-bold rounded-lg">
              Anual
            </span>
          </div>
        </div>
      </div>

      {/* Modal Paso 2: Gestionar Libreta de Direcciones */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-xl w-full p-6 space-y-6 border border-neutral-800 text-white shadow-2xl animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white uppercase tracking-tight">
                  Libreta de Direcciones ({addressesList.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  setShowAddForm(false);
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Direcciones Guardadas */}
            <div className="space-y-3">
              {addressesList.length === 0 ? (
                <div className="p-8 text-center bg-black/40 rounded-xl border border-neutral-800 space-y-2">
                  <MapPin className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-xs text-neutral-400 italic">No tienes direcciones guardadas aún.</p>
                </div>
              ) : (
                addressesList.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                      addr.isDefault
                        ? "bg-purple-950/20 border-purple-500/40"
                        : "bg-black/40 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{addr.street}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Predeterminada ✓
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-300">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-neutral-500 font-mono text-[11px]">{addr.country}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-purple-600 text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-colors"
                          title="Usar como predeterminada"
                        >
                          Hacer Predeterminada
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Eliminar dirección"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Formulario Agregar Nueva Dirección */}
            {showAddForm ? (
              <form onSubmit={handleAddAddressSubmit} className="p-4 bg-black/60 rounded-xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Nueva Dirección de Envío
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>

                {/* 1. Selector de País en Cascada */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    País *
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      const countryObj = Country.getCountryByCode(code);
                      setSelectedCountryCode(code);
                      setCountryInput(countryObj ? countryObj.name : code);
                      setSelectedStateCode("");
                      setStateInput("");
                      setCityInput("");
                    }}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
                  >
                    {countriesList.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name} ({c.isoCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* 2. Selector de Estado / Depto en Cascada */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Estado / Departamento *
                    </label>
                    <select
                      disabled={!selectedCountryCode || statesList.length === 0}
                      value={selectedStateCode}
                      onChange={(e) => {
                        const sCode = e.target.value;
                        const stateObj = State.getStateByCodeAndCountry(sCode, selectedCountryCode);
                        setSelectedStateCode(sCode);
                        setStateInput(stateObj ? stateObj.name : sCode);
                        setCityInput("");
                      }}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
                    >
                      <option value="">
                        {!selectedCountryCode
                          ? "-- Elige un País --"
                          : statesList.length === 0
                          ? "-- Sin estados disponibles --"
                          : "-- Seleccionar Estado --"}
                      </option>
                      {statesList.map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Selector de Ciudad en Cascada */}
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Ciudad *
                    </label>
                    {citiesList.length > 0 ? (
                      <select
                        disabled={!selectedStateCode}
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
                      >
                        <option value="">
                          {!selectedStateCode ? "-- Elige un Estado --" : "-- Seleccionar Ciudad --"}
                        </option>
                        {citiesList.map((ci, idx) => (
                          <option key={`${ci.name}-${idx}`} value={ci.name}>
                            {ci.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        disabled={!selectedStateCode}
                        placeholder={!selectedStateCode ? "Elige un Estado" : "Ingresa la ciudad"}
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Calle y Número (Dirección) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Av. Javier Prado 1234, Dpto 501"
                    value={streetInput}
                    onChange={(e) => setStreetInput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                    Código Postal (ZIP)
                  </label>
                  <input
                    type="text"
                    placeholder="15027"
                    value={postalCodeInput}
                    onChange={(e) => setPostalCodeInput(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefaultAdd"
                    checked={isDefaultInput}
                    onChange={(e) => setIsDefaultInput(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="isDefaultAdd" className="text-xs font-semibold text-neutral-300 cursor-pointer">
                    Establecer como dirección predeterminada de envío
                  </label>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingAddress}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Guardar Dirección</span>
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-purple-300 font-bold text-xs rounded-xl border border-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nueva Dirección</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Interactivo para Completar Perfil (Paso 3 Toggle Marketing) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-md w-full p-6 space-y-5 border border-neutral-800 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Completa tu Perfil (+{profileRule?.pointsReward || 20} pts)</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteProfileSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split("T")[0]}
                  value={birthdateInput}
                  onChange={(e) => setBirthdateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-400" /> Teléfono de Contacto (Opcional)
                </label>
                <PhoneInput
                  defaultCountry="PE"
                  placeholder="987 654 321"
                  value={phoneInput}
                  onChange={(val) => setPhoneInput(val || "")}
                />
              </div>

              {/* Paso 3: Switch/Toggle de Marketing */}
              <div className="p-3.5 bg-black/60 rounded-xl border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Deseo recibir ofertas y drops</span>
                  </div>
                  <input
                    type="checkbox"
                    id="marketingModalToggle"
                    checked={acceptsMarketingInput}
                    onChange={(e) => setAcceptsMarketingInput(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 pl-6">
                  Suscríbete para lanzamientos exclusivos de cartas TCG y cupones de descuento.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Reclamar +{profileRule?.pointsReward || 20} Pts</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
