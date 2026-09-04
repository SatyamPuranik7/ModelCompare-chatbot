import { ComparisonResult } from './types';

export const MOCK_COMPARISONS: Record<string, ComparisonResult> = {
  default: {
    id: 'comp-upi-demo',
    timestamp: new Date().toISOString(),
    prompt: 'Explain how UPI (Unified Payments Interface) works in simple terms, with an example transaction flow.',
    isDemo: true,
    evaluatorModel: 'Google Gemini 2.0 Flash (Judge)',
    winnerModelId: 'google/gemini-2.0-flash-exp:free',
    winnerRationale:
      '🏆 Gemini 2.0 Flash earned the top score (9.4/10) by providing the most intuitive real-world analogy (VPA as an email address for bank accounts), a clean ASCII architecture diagram, and an effortless explanation of two-factor MPIN security without excessive banking jargon.',
    responses: [
      {
        modelId: 'google/gemini-2.0-flash-exp:free',
        modelName: 'Gemini 2.0 Flash (Free)',
        provider: 'Google',
        latencyMs: 840,
        tokensUsed: 462,
        content: `### What is UPI?
Think of UPI (**Unified Payments Interface**) like an **"Email ID for your bank account"**. 

Before UPI, sending money required entering complex details: 16-digit account numbers, IFSC codes, branch names, and waiting hours for NEFT clearance. UPI replaces all of that with a simple Virtual Payment Address (VPA) like \`alex@okaxis\` or your phone number.

---

### Key Pillars of UPI
1. **Virtual Payment Address (VPA):** Masks your real bank details so you never share account numbers.
2. **NPCI (National Payments Corp of India):** The central high-speed digital highway connecting all banks.
3. **IMPS Engine:** Enables 24/7 instant settlement in under 2 seconds.
4. **2-Factor Authentication:** Requires both device binding (your SIM) and your secret UPI PIN.

---

### Step-by-Step Transaction Flow

Suppose **Rahul** wants to pay **₹250** to **Priya's Coffee Shop**:

\`\`\`text
[Rahul Phone (GPay/PhonePe)] ──► Scans Priya's QR Code & Enters MPIN
                                           │
                                           ▼
                                [NPCI Central Switch]
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
     [Rahul's Bank (HDFC)]                                     [Priya's Bank (ICICI)]
   • Verifies MPIN & Balance                                 • Credits ₹250 immediately
   • Debits ₹250                                             • Sends SMS confirmation
             │                                                           │
             └─────────────────────────────┬─────────────────────────────┘
                                           ▼
                                 [Instant Success ✅]
\`\`\`

Total elapsed time: **~1.5 seconds**.`,
      },
      {
        modelId: 'meta-llama/llama-3.3-70b-instruct:free',
        modelName: 'Llama 3.3 70B (Free)',
        provider: 'Meta',
        latencyMs: 1420,
        tokensUsed: 512,
        content: `### Understanding UPI (Unified Payments Interface)

UPI is an instant real-time payment system developed by the National Payments Corporation of India (NPCI) and regulated by the Reserve Bank of India (RBI). It facilitates inter-bank peer-to-peer (P2P) and person-to-merchant (P2M) transactions.

#### Core Components
- **Payer & Payee PSP (Payment Service Providers):** Applications like Google Pay, PhonePe, Paytm, or BHIM.
- **NPCI Switch:** The routing hub that validates routing between issuing and acquiring banks.
- **Banks (Remitter & Beneficiary):** The institutions holding the fiat currency balances.

#### Transaction Example:
1. **Initiation:** The sender inputs recipient's VPA (\`user@upi\`) and amount.
2. **Authentication:** The sender enters a 4 or 6-digit MPIN encrypted via mobile hardware key.
3. **Routing:** The request reaches NPCI, which queries the central directory to resolve the VPA to the destination bank IFSC & Account.
4. **Settlement:** The remitter bank debits funds; beneficiary bank credits funds via Immediate Payment Service (IMPS).
5. **Confirmation:** Push notification is dispatched to both parties.

#### Security Benefits
- No need to reveal account numbers.
- SIM card binding prevents remote spoofing.
- End-to-end encryption from handset to bank gateway.`,
      },
      {
        modelId: 'deepseek/deepseek-r1:free',
        modelName: 'DeepSeek R1 (Free)',
        provider: 'DeepSeek',
        latencyMs: 2150,
        tokensUsed: 620,
        content: `### UPI Explained Simply: The Seamless Money Switchboard

To understand UPI, imagine a global airport with dozens of airlines. Instead of buying tickets separately at each counter with paper verification, you have a single universal digital passport that checks you in everywhere in 10 seconds. That is UPI for banking.

#### Why was UPI revolutionary?
1. **Interoperability:** You can use GPay on HDFC Bank to pay someone on Paytm using ICICI Bank. It doesn't matter which app or bank you have.
2. **Zero Financial Exposure:** Your account number and branch code stay hidden behind your handle (\`john@upi\`).
3. **Pull & Push Payments:** You can both send money (Push) and request money / authorize autopay (Pull).

#### Step-by-Step Flow:
- **Step 1:** User initiates payment via QR code or phone number.
- **Step 2:** Secure handshake: The app requests NPCI for account resolution.
- **Step 3:** The user enters their MPIN into the NPCI common library (the app itself never sees your PIN).
- **Step 4:** Remitter bank ledger decrements balance.
- **Step 5:** Beneficiary bank ledger increments balance.
- **Step 6:** Both parties receive instant transaction IDs.

*Verdict: One of the world's most advanced public digital financial infrastructures.*`,
      },
    ],
    evaluations: [
      {
        modelId: 'google/gemini-2.0-flash-exp:free',
        modelName: 'Gemini 2.0 Flash (Free)',
        overallScore: 9.4,
        rank: 1,
        criteria: {
          accuracy: { name: 'Accuracy', score: 9.6, comment: 'Technically precise NPCI and IMPS details.' },
          completeness: { name: 'Completeness', score: 9.3, comment: 'Covered security, architecture, and examples.' },
          clarity: { name: 'Clarity', score: 9.7, comment: 'Exceptional visual ASCII diagram and email analogy.' },
          reasoning: { name: 'Reasoning', score: 9.1, comment: 'Direct, logical, and easy for any reader to digest.' },
        },
        strengths: [
          'Brilliant "email ID for bank" analogy',
          'Included an ASCII visual sequence diagram',
          'Fastest response latency (840ms)',
        ],
        weaknesses: ['Could mention auto-pay / mandate features'],
        summary: 'Outstanding answer combining intuitive explanations with technical accuracy and visual layout.',
      },
      {
        modelId: 'meta-llama/llama-3.3-70b-instruct:free',
        modelName: 'Llama 3.3 70B (Free)',
        overallScore: 9.0,
        rank: 2,
        criteria: {
          accuracy: { name: 'Accuracy', score: 9.4, comment: 'Accurate terminology (PSP, remitter, beneficiary).' },
          completeness: { name: 'Completeness', score: 9.1, comment: 'Comprehensive banking flow breakdown.' },
          clarity: { name: 'Clarity', score: 8.7, comment: 'Slightly formal and banking-oriented.' },
          reasoning: { name: 'Reasoning', score: 8.9, comment: 'Good technical sequencing.' },
        },
        strengths: ['Rigorous institutional definitions (RBI/NPCI)', 'Clear breakdown of P2P vs P2M'],
        weaknesses: ['Less approachable for non-technical readers'],
        summary: 'Very solid, professional banking explanation with strong structural rigor.',
      },
      {
        modelId: 'deepseek/deepseek-r1:free',
        modelName: 'DeepSeek R1 (Free)',
        overallScore: 8.8,
        rank: 3,
        criteria: {
          accuracy: { name: 'Accuracy', score: 9.2, comment: 'Correct details on NPCI common library for MPIN.' },
          completeness: { name: 'Completeness', score: 8.9, comment: 'Explains push vs pull payments.' },
          clarity: { name: 'Clarity', score: 8.6, comment: 'Airport analogy was creative but slightly stretched.' },
          reasoning: { name: 'Reasoning', score: 8.7, comment: 'Strong emphasis on architectural benefits.' },
        },
        strengths: ['Highlighted the NPCI common library security', 'Addressed push vs pull mandates'],
        weaknesses: ['Higher latency than peers', 'Slightly wordy intro'],
        summary: 'Great conceptual overview focusing on the systemic benefits and interoperability of UPI.',
      },
    ],
  },
};
