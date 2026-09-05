"use client";

import React, { useState, useTransition } from "react";
import {
  Award,
  Trophy,
  Target,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Shield,
  Layers,
  Zap,
  Gift,
  UserCheck,
  ShoppingBag,
  Star,
  Cake,
  UploadCloud,
  X,
  RefreshCw,
} from "lucide-react";
import { LoyaltyActionType } from "@prisma/client";
import {
  upsertLoyaltyTierAction,
  deleteLoyaltyTierAction,
  updateLoyaltyRuleAction,
  seedDefaultLoyaltyConfigAction,
} from "./actions";

interface TierItem {
  id: string;
  name: string;
  minPoints: number;
  badgeImageUrl?: string | null;
  perks?: string | null;
}

interface RuleItem {
  id: string;
  actionType: LoyaltyActionType;
  pointsReward: number;
  isActive: boolean;
}

const ACTION_LABELS: Record<
  LoyaltyActionType,
  { title: string; desc: string; icon: React.ReactNode; defaultPoints: number }
> = {
  ACCOUNT_CREATION: {
    title: "Bono de Bienvenida (Registro)",
    desc: "Puntos otorgados automáticamente al crear una nueva cuenta en la tienda.",
    icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
    defaultPoints: 50,
  },
  PURCHASE: {
    title: "Acumulación por Compras",
    desc: "Puntos otorgados por cada unidad monetaria (S/. 1.00 o $1.00) gastada en órdenes pagadas.",
    icon: <ShoppingBag className="w-5 h-5 text-cyan-500" />,
    defaultPoints: 1,
  },
  PROFILE_COMPLETION: {
    title: "Misión: Completa tu Perfil",
    desc: "Recompensa por ingresar fecha de nacimiento y teléfono de contacto.",
    icon: <Target className="w-5 h-5 text-purple-500" />,
    defaultPoints: 20,
  },
  PRODUCT_REVIEW: {
    title: "Misión: Reseña de Producto",
    desc: "Puntos otorgados por calificar y opinar sobre un producto adquirido.",
    icon: <Star className="w-5 h-5 text-amber-500" />,
    defaultPoints: 15,
  },
  BIRTHDAY: {
    title: "Regalo de Cumpleaños Anual",
    desc: "Bono especial otorgado automáticamente el día del cumpleaños del cliente.",
    icon: <Cake className="w-5 h-5 text-pink-500" />,
    defaultPoints: 100,
  },
};

export default function LoyaltySettingsClient({
  tiers,
  rules,
}: {
  tiers: TierItem[];
  rules: RuleItem[];
}) {
  const [activeTab, setActiveTab] = useState<"tiers" | "rules">("tiers");
  const [isPending, startTransition] = useTransition();
  const [editingTier, setEditingTier] = useState<TierItem | null>(null);
  const [isCreatingTier, setIsCreatingTier] = useState(false);

  // Reglas estado local para edición interactiva
  const [ruleStates, setRuleStates] = useState<
    Record<LoyaltyActionType, { pointsReward: number; isActive: boolean }>
  >(() => {
    const map = {} as Record<LoyaltyActionType, { pointsReward: number; isActive: boolean }>;
    const allActions: LoyaltyActionType[] = [
      "ACCOUNT_CREATION",
      "PURCHASE",
      "PROFILE_COMPLETION",
      "PRODUCT_REVIEW",
      "BIRTHDAY",
    ];

    allActions.forEach((type) => {
      const found = rules.find((r) => r.actionType === type);
      map[type] = {
        pointsReward: found ? found.pointsReward : ACTION_LABELS[type].defaultPoints,
        isActive: found ? found.isActive : true,
      };
    });
    return map;
  });

  const handleRuleToggle = (type: LoyaltyActionType) => {
    const current = ruleStates[type];
    const updated = { ...current, isActive: !current.isActive };
    setRuleStates({ ...ruleStates, [type]: updated });

    startTransition(async () => {
      await updateLoyaltyRuleAction(type, updated.pointsReward, updated.isActive);
    });
  };

  const handleRulePointsChange = (type: LoyaltyActionType, value: number) => {
    const current = ruleStates[type];
    const updated = { ...current, pointsReward: Math.max(0, value) };
    setRuleStates({ ...ruleStates, [type]: updated });
  };

  const handleSaveRule = (type: LoyaltyActionType) => {
    const current = ruleStates[type];
    startTransition(async () => {
      await updateLoyaltyRuleAction(type, current.pointsReward, current.isActive);
    });
  };

  const handleSeedDefaults = () => {
    startTransition(async () => {
      await seedDefaultLoyaltyConfigAction();
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-body text-slate-900">
      {/* Header del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-pink-600" />
            <span>Motor de Gamificación GOSU® Loyalty</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configura los niveles dinámicos de fidelización, recompensas en puntos e incentivos de comportamiento estilo Smile.io.
          </p>
        </div>

        {tiers.length === 0 && (
          <button
            onClick={handleSeedDefaults}
            disabled={isPending}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            <span>Cargar Configuración Inicial</span>
          </button>
        )}
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab("tiers")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "tiers"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Niveles & Rangos ({tiers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-pink-600 text-pink-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Formas de Ganar (Misiones)</span>
        </button>
      </div>

      {/* PESTAÑA 1: NIVELES (TIERS) */}
      {activeTab === "tiers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Niveles Gamificados Configurables
            </h2>

            <button
              onClick={() => {
                setEditingTier(null);
                setIsCreatingTier(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Nivel</span>
            </button>
          </div>

          {tiers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">No hay niveles configurados</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Crea los niveles de tu programa de fidelización o carga la configuración predeterminada.
                </p>
              </div>
              <button
                onClick={handleSeedDefaults}
                className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Cargar Niveles por Defecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {tier.badgeImageUrl ? (
                          <img
                            src={tier.badgeImageUrl}
                            alt={tier.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-extrabold text-xl shrink-0">
                            🏆
                          </div>
                        )}
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900">{tier.name}</h3>
                          <span className="text-xs font-mono font-bold text-pink-600 block">
                            Desde {tier.minPoints} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[4rem]">
                      {tier.perks || "Sin beneficios especificados."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsCreatingTier(false);
                        setEditingTier(tier);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar el nivel "${tier.name}"?`)) {
                          startTransition(async () => {
                            await deleteLoyaltyTierAction(tier.id);
                          });
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Eliminar nivel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal / Formulario para Crear o Editar Nivel */}
          {(isCreatingTier || editingTier) && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-pink-600" />
                    <span>{editingTier ? "Editar Nivel GOSU Loyalty" : "Crear Nuevo Nivel"}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingTier(false);
                      setEditingTier(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  action={async (formData) => {
                    await upsertLoyaltyTierAction(formData);
                    setIsCreatingTier(false);
                    setEditingTier(null);
                  }}
                  className="space-y-4"
                >
                  {editingTier && <input type="hidden" name="id" value={editingTier.id} />}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nombre del Nivel (Rango)
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingTier?.name || ""}
                      required
                      placeholder="Ej. Meta Player 🥈"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Puntos Mínimos Requeridos
                    </label>
                    <input
                      type="number"
                      name="minPoints"
                      defaultValue={editingTier?.minPoints ?? 0}
                      required
                      min={0}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      URL de la Insignia (Badge Image URL)
                    </label>
                    <input
                      type="url"
                      name="badgeImageUrl"
                      defaultValue={editingTier?.badgeImageUrl || ""}
                      placeholder="https://mis-imagenes.com/badge.png"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Beneficios e Incentivos (Perks)
                    </label>
                    <textarea
                      name="perks"
                      rows={3}
                      defaultValue={editingTier?.perks || ""}
                      placeholder="Ej. Acceso anticipado a drops de cartas y 5% de cashback en puntos."
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingTier(false);
                        setEditingTier(null);
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Nivel</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: FORMAS DE GANAR (MISIONES DE GAMIFICACIÓN) */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Reglas e Incentivos de Comportamiento (Smile.io Style)
            </h2>
          </div>

          <div className="space-y-4">
            {(
              [
                "ACCOUNT_CREATION",
                "PURCHASE",
                "PROFILE_COMPLETION",
                "PRODUCT_REVIEW",
                "BIRTHDAY",
              ] as LoyaltyActionType[]
            ).map((actionType) => {
              const meta = ACTION_LABELS[actionType];
              const state = ruleStates[actionType];

              return (
                <div
                  key={actionType}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    state.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50/60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl shrink-0 mt-0.5">{meta.icon}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">{meta.title}</h3>
                        {!state.isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                            Desactivada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 max-w-lg">{meta.desc}</p>
                    </div>
                  </div>

                  {/* Controles de Configuración de la Regla */}
                  <div className="flex items-center gap-4 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {/* Toggle Switch */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRuleToggle(actionType)}
                        disabled={isPending}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          state.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            state.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-bold font-mono text-slate-700">
                        {state.isActive ? "ACTIVA" : "APAGADA"}
                      </span>
                    </div>

                    {/* Input de Puntos Asignados */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Puntos:</span>
                      <input
                        type="number"
                        min={0}
                        value={state.pointsReward}
                        onChange={(e) =>
                          handleRulePointsChange(actionType, parseInt(e.target.value || "0", 10))
                        }
                        className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-slate-400"
                      />
                      <button
                        onClick={() => handleSaveRule(actionType)}
                        disabled={isPending}
                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Guardar recompensa"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
