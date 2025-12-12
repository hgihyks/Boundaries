// RBC production model utility implementing the specified equations

// Default parameters per spec
const DEFAULT_PARAMS = {
  BV0: 3.9e6, // µL
  N_star: 1.8e13, // cells
  lambda: 1 / 120, // day^-1
  alpha: 2,
  tau_days: 3, // days
  wh: 1.0,
  wex: 0.5,
  wI: 0.8,
  ws: 0.3,
};

function computeP0(params) {
  return params.lambda * params.N_star;
}

export function createRbcModel(overrides = {}) {
  const params = { ...DEFAULT_PARAMS, ...overrides };
  const P0 = computeP0(params);
  const state = {
    N: params.N_star, // Initial condition N0 = N_star
  };
  return { params: { ...params, P0 }, state };
}

// Deterministic mocked daily inputs in [0,1] ranges or realistic units
// tDays is time in days (can be fractional)
export function mockDailyInputs(tDays) {
  // Smooth circadian/weekly-like patterns
  const day = tDays;
  const TWO_PI = Math.PI * 2;

  // menstrual cycle day for B and M
  const cycleDay = ((day % 28) + 28) % 28;

  // Hydration ~ baseline 0 with small oscillations (as fraction of BV)
  const H2O = 0.01 * (1 + 0.5 * Math.sin(TWO_PI * (day % 1))); // ~1% +/- 0.5%

  // Exercise training load TL in [0,1]
  const TL = 0.4 + 0.3 * Math.max(0, Math.sin(TWO_PI * (day / 7))); // weekly rhythm

  // Altitude exposure hours h in [0,1] scaled proxy (0 to ~800 equivalent)
  // We simulate intermittent altitude days
  const altitudeCycle = Math.max(0, Math.sin(TWO_PI * (day / 21)));
  const h = 600 * altitudeCycle; // hours at altitude proxy

  // Illness I in [0,1] occasional spikes
  const I = (Math.sin(TWO_PI * (day / 30 + 0.3)) > 0.95) ? 0.6 : 0.05;

  // Stress/immune activation proxy X in [0,1]
  const X = 0.3 + 0.3 * Math.max(0, Math.sin(TWO_PI * (day / 5 + 0.1)));

  // Catecholamine C in [0,1]
  const C = 0.1 + 0.2 * Math.max(0, Math.sin(TWO_PI * (day % 1)));

  // Circadian phase phi in radians [0, 2π)
  const phi = TWO_PI * (day % 1);

  // Bleeding and D-dimer proxies B, D in [0,1]
  const B = (cycleDay >= 0 && cycleDay < 5) ? 0.4 : 0.05; // menstruation days higher
  const D = 0.05 + 0.05 * Math.max(0, Math.sin(TWO_PI * (day / 9 + 0.2)));

  // Iron availability Fe in [0,1]
  const Fe = 0.7 + 0.2 * Math.sin(TWO_PI * (day / 10 + 0.2));

  // Training expansion fractional Delta_train in [0, ~0.1]
  const Delta_train = 0.03 * Math.max(0, Math.sin(TWO_PI * (day / 14)));

  // Menstrual blood loss M in µL/day: periodic every 28 days, ~ 40 mL over 5 days
  const isMenstruation = cycleDay >= 0 && cycleDay < 5;
  const dailyLossUl = isMenstruation ? (40000 / 5) : 0; // 40,000 µL over 5 days
  const M = dailyLossUl; // µL/day

  const smoker = false;

  return { h, TL, I, Fe, H2O, Delta_train, M, smoker, X, C, phi, B, D };
}

// One integration step of the model
// state: { N }
// tDays: current time in days
// inputs: function of time => object, or object at current time
// params: model constants including P0
// dtDays: time step in days
export function stepRbc(state, tDays, inputs, params, dtDays) {
  const getInputsAt = (timeDays) =>
    typeof inputs === 'function' ? inputs(timeDays) : inputs;

  const tDelay = Math.max(0, tDays - params.tau_days);
  const inpNow = getInputsAt(tDays);
  const inpDelay = getInputsAt(tDelay);

  const { H2O, Delta_train, M, smoker } = inpNow;
  const { h: hD, TL: TLD, I: ID, Fe: FeD } = inpDelay;

  // Helper computations
  const S_alt = 1 - Math.exp(-(hD) / 1700);
  const S_train = TLD / (3 + TLD);
  const smokerBonus = smoker ? params.ws * 0.2 : 0;
  const S = params.wh * S_alt + params.wex * S_train - params.wI * ID + smokerBonus;

  const qFe = FeD;
  const P = params.P0 * qFe * (1 + params.alpha * Math.tanh(S));

  const BV = params.BV0 * (1 + Delta_train + H2O);
  const N = Math.max(0, state.N);
  const C_RBC = N / BV; // cells per µL
  const L_men = M * C_RBC; // cells/day

  const dN = (P - params.lambda * N - L_men) * dtDays;
  const Nnext = Math.max(0, N + dN);
  const RBC_per_uL = Nnext / BV;

  return { N: Nnext, RBC_per_uL, RBC_total: Nnext };
}

const rbcApi = {
  createRbcModel,
  mockDailyInputs,
  stepRbc,
  createWbcModel,
  stepWbc,
  createPltModel,
  stepPlt,
};

export default rbcApi;

// ========================= WBC MODEL =========================

const DEFAULT_WBC_PARAMS = {
  BV0: 3.9e6,
  WBC_per_uL_star: 6.5e3,
  lambda_w: 0.693, // day^-1
  beta_w: 3.0,
  aX: 1.2,
  aI: 0.6,
  tau_p: 1.0,
  k_rel: 0.5,
  k_ret: 0.2,
  gamma_C: 2.0,
  A_c: 0.08,
};

export function createWbcModel(overrides = {}) {
  const params = { ...DEFAULT_WBC_PARAMS, ...overrides };
  const Nw_star = params.WBC_per_uL_star * params.BV0;
  const Pw0 = params.lambda_w * Nw_star;
  // Choose reservoir steady state Rw_ss to balance steady dynamics at baseline
  const Rw_ss = ((params.k_ret + params.lambda_w) / params.k_rel) * Nw_star;
  const state = {
    Nw: Nw_star,
    Rw: Rw_ss,
  };
  return { params: { ...params, Nw_star, Pw0 }, state };
}

export function stepWbc(state, tDays, inputs, params, dtDays) {
  const getInputsAt = (timeDays) =>
    typeof inputs === 'function' ? inputs(timeDays) : inputs;

  const tDelay = Math.max(0, tDays - params.tau_p);
  const inpNow = getInputsAt(tDays);
  const inpDelay = getInputsAt(tDelay);

  const { Delta_train, H2O, C, phi } = inpNow;
  const { X: XD, I: ID } = inpDelay;

  const S_inf = params.aX * XD + params.aI * ID;
  const Pw = params.Pw0 * (1 + params.beta_w * Math.tanh(S_inf));

  const rel = params.k_rel * (1 + params.gamma_C * C) * state.Rw;
  const ret = params.k_ret * state.Nw;

  const BV = params.BV0 * (1 + Delta_train + H2O);

  const Rw_next = Math.max(0, state.Rw + (Pw - rel + ret) * dtDays);
  const Nw_next = Math.max(0, state.Nw + (rel - ret - params.lambda_w * state.Nw) * dtDays);

  const q_circ = 1 + params.A_c * Math.sin(phi);
  const WBC_per_uL = (Nw_next / BV) * q_circ;

  return { Nw: Nw_next, Rw: Rw_next, WBC_per_uL, WBC_total: Nw_next + Rw_next };
}

// ========================= PLATELET MODEL =========================

const DEFAULT_PLT_PARAMS = {
  BV0: 3.9e6,
  PLT_per_uL_star: 250e3,
  lambda_p: 1 / 9, // day^-1
  alpha_p: 2.0,
  kappa_p: 1.0,
  rho: 1.0,
  eta_I: 0.6,
  tau_T: 3.0,
  s_in: 0.15,
  s_out: 0.12,
  gamma_C: 2.0,
  theta_B: 0.1,
  theta_D: 0.3,
};

export function createPltModel(overrides = {}) {
  const params = { ...DEFAULT_PLT_PARAMS, ...overrides };
  const Np_star = params.PLT_per_uL_star * params.BV0;
  const Pp0 = params.lambda_p * Np_star;
  // Steady-state Sp when C=0: s_in*Np = s_out*Sp => Sp = (s_in/s_out)*Np
  const Sp_ss = (params.s_in / params.s_out) * Np_star;
  const state = {
    Np: Np_star,
    Sp: Sp_ss,
    history: [], // store past { t, Np, Sp }
  };
  return { params: { ...params, Np_star, Pp0 }, state };
}

function getDelayedPlateletState(state, tTarget) {
  // find last history entry with t <= tTarget
  if (!state.history || state.history.length === 0) {
    return { Np: state.Np, Sp: state.Sp };
  }
  for (let i = state.history.length - 1; i >= 0; i -= 1) {
    const entry = state.history[i];
    if (entry.t <= tTarget) {
      return { Np: entry.Np, Sp: entry.Sp };
    }
  }
  return { Np: state.Np, Sp: state.Sp };
}

export function stepPlt(state, tDays, inputs, params, dtDays) {
  const getInputsAt = (timeDays) =>
    typeof inputs === 'function' ? inputs(timeDays) : inputs;

  const tDelay = Math.max(0, tDays - params.tau_T);
  const inpNow = getInputsAt(tDays);
  const inpDelay = getInputsAt(tDelay);

  const { Delta_train, H2O, C, B, D } = inpNow;
  const { I: ID } = inpDelay;

  const delayedState = getDelayedPlateletState(state, tDelay);
  const Mp = delayedState.Np + delayedState.Sp;

  const feedback = params.alpha_p * Math.tanh((params.kappa_p / (1 + params.rho * Mp / params.Np_star)) - 1);
  const Pp = params.Pp0 * (1 + feedback + params.eta_I * ID);

  const release = params.s_out * (1 + params.gamma_C * C) * state.Sp;
  const seques = params.s_in * state.Np;
  const consumption = params.theta_B * B * state.Np + params.theta_D * D * state.Np;

  const Sp_next = Math.max(0, state.Sp + (seques - release) * dtDays);
  const Np_next = Math.max(0, state.Np + (Pp + release - seques - params.lambda_p * state.Np - consumption) * dtDays);

  const BV = params.BV0 * (1 + Delta_train + H2O);
  const PLT_per_uL = Np_next / BV;

  // push history entry for current step end
  const nextHistory = state.history || [];
  nextHistory.push({ t: tDays + dtDays, Np: Np_next, Sp: Sp_next });
  // Keep history bounded
  if (nextHistory.length > 1000) nextHistory.shift();

  const PLT_total = Np_next + Sp_next;
  return { Np: Np_next, Sp: Sp_next, history: nextHistory, PLT_per_uL, PLT_total };
}



