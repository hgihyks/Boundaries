## Run the app

1. Install deps: `npm install`
2. Start dev server: `npm start`
3. Open `http://localhost:3000`

## Live biometrics (RBC, WBC, Platelets)

Implementation lives in `src/utils/rbcModel.js` and is wired in `src/pages/Information.jsx`.
- Update cadence: every 3 ms with integration step `dtDays = 0.3/86400` days.
- Inputs are mocked via `mockDailyInputs(tDays)` and include hydration, training load, illness, iron, stress, catecholamines, circadian phase, and menstrual-related signals.

### RBC
- State: `N` (cells); Output: `RBC_per_uL = N / BV`.
- Production: `P = P0 * qFe * (1 + α * tanh(S))` with delayed inputs (τ = 3 d).
- Update: `N[t+1] = N[t] + (P - λ*N[t] - L_men) * dt` where `L_men = M * (N/BV)`.

### WBC
- State: `Nw` (circulating), `Rw` (reservoir); Output: `WBC_per_uL = (Nw/BV) * q_circ`.
- Production: `Pw = Pw0 * (1 + β_w * tanh(aX*X_{t-τ} + aI*I_{t-τ}))`, τ = 1 d.
- Exchange: `rel = k_rel*(1 + γ_C*C)*Rw`, `ret = k_ret*Nw`.
- Updates: `Rw' = Pw - rel + ret`, `Nw' = rel - ret - λ_w*Nw`.

### Platelets
- State: `Np` (circulating), `Sp` (sequestered); Output: `PLT_per_uL = Np / BV`.
- Production: `Pp = Pp0*(1 + α_p*tanh((κ_p/(1+ρ*Mp/Np_*)) - 1) + η_I*I_{t-τ})`, τ = 3 d.
- Exchange/consumption: `release = s_out*(1+γ_C*C)*Sp`, `seques = s_in*Np`, `consumption = θ_B*B*Np + θ_D*D*Np`.
- Updates: `Sp' = seques - release`, `Np' = Pp + release - seques - λ_p*Np - consumption`.
