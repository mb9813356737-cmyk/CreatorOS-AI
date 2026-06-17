export const getMockUsers = () => {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return [
    {
      id: "usr_1",
      clerkId: "user_2wK...",
      email: "admin@creatoros.ai",
      name: "Super Admin (You)",
      role: "SUPER_ADMIN",
      plan: "AGENCY",
      subscriptionStatus: "ACTIVE",
      monthlyCredits: -1,
      creditsUsed: 42,
      banned: false,
      suspendedUntil: null,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usr_2",
      clerkId: "user_3aC...",
      email: "creator.a@creatoros.ai",
      name: "Creator Alpha",
      role: "USER",
      plan: "AGENCY",
      subscriptionStatus: "ACTIVE",
      monthlyCredits: -1,
      creditsUsed: 120,
      banned: false,
      suspendedUntil: null,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usr_3",
      clerkId: "user_4mQ...",
      email: "creator.b@creatoros.ai",
      name: "Creator Beta",
      role: "USER",
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
      monthlyCredits: 500,
      creditsUsed: 382,
      banned: false,
      suspendedUntil: null,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usr_4",
      clerkId: "user_5zT...",
      email: "suspicious_bot_99@spambot.invalid",
      name: "Spam Profile",
      role: "USER",
      plan: "FREE",
      subscriptionStatus: "INACTIVE",
      monthlyCredits: 10,
      creditsUsed: 10,
      banned: true,
      suspendedUntil: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usr_5",
      clerkId: "user_6pW...",
      email: "finance.manager@creatoros.ai",
      name: "Amit Finance",
      role: "FINANCE_ADMIN",
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
      monthlyCredits: 500,
      creditsUsed: 15,
      banned: false,
      suspendedUntil: null,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const getMockPayments = () => {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return [
    {
      id: "pay_1",
      userId: "usr_1",
      razorpayPaymentId: "pay_Oq3wQ9a023b",
      razorpaySubscriptionId: "sub_Nq9a023bd328",
      amount: 199900,
      currency: "INR",
      status: "SUCCESS",
      plan: "AGENCY",
      billingPeriod: "monthly",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "pay_2",
      userId: "usr_3",
      razorpayPaymentId: "pay_Kx8tZ5h021a",
      razorpaySubscriptionId: "sub_Mx8tZ5h021a",
      amount: 49900,
      currency: "INR",
      status: "SUCCESS",
      plan: "PRO",
      billingPeriod: "monthly",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "pay_3",
      userId: "usr_2",
      razorpayPaymentId: "pay_Fr3aO9q873v",
      razorpaySubscriptionId: "sub_Er3aO9q873v",
      amount: 1918800,
      currency: "INR",
      status: "SUCCESS",
      plan: "AGENCY",
      billingPeriod: "yearly",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "pay_4",
      userId: "usr_3",
      razorpayPaymentId: "pay_failed_123",
      razorpaySubscriptionId: "sub_failed_123",
      amount: 49900,
      currency: "INR",
      status: "FAILED",
      plan: "PRO",
      billingPeriod: "monthly",
      createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
    },
  ];
};

export const getMockTickets = () => {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return [
    {
      id: "tkt_1",
      subject: "Razorpay payment completed but account still shows Starter",
      message: "Hi, I just upgraded to the Pro plan (₹499) and got a success notification from Razorpay, but my dashboard still says Starter and I cannot generate visual thumbnail psychology sheets. Please help!",
      status: "OPEN",
      priority: "URGENT",
      assignedTo: "Support Agent Amit",
      internalNote: "Check webhook payload for Razorpay subscription verify mismatch.",
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      user: {
        name: "Ajay Creator",
        email: "ajay@creatoros.ai",
      },
    },
    {
      id: "tkt_2",
      subject: "Requesting Refund for Double Charge",
      message: "My bank shows two charges of ₹1,999. I only subscribed to one Agency account. I need a refund for the second transaction.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignedTo: "Amit Finance",
      internalNote: "Second payment ID: pay_double_charge_992 has status SUCCESS. Refunding transaction...",
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      user: {
        name: "Tanmay Creator Agency",
        email: "tanmay@creatoros.ai",
      },
    },
    {
      id: "tkt_3",
      subject: "Custom Prompts for YouTube Reels not saving",
      message: "When I write custom prompts in the scripting engine, clicking save spins forever and then fails. What's wrong?",
      status: "RESOLVED",
      priority: "MEDIUM",
      assignedTo: "Moderator Sneha",
      internalNote: "Resolved. Prompt characters length was exceeding limits.",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      user: {
        name: "Demo Creator",
        email: "demo@creatoros.ai",
      },
    },
  ];
};

export const getMockQueueJobs = () => {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  return [
    {
      id: "job_mock1",
      jobId: "job_9a8f2",
      type: "SCRIPT",
      status: "completed",
      retryCount: 0,
      maxRetries: 3,
      workerId: "worker_1292",
      executionTimeMs: 1450,
      createdAt: new Date().toISOString(),
      user: { name: "Tanmay Creator Agency", email: "tanmay@creatoros.ai" },
    },
    {
      id: "job_mock2",
      jobId: "job_5c21b",
      type: "VIRAL_HOOK",
      status: "failed",
      error: "Gemini API Timeout after 8000ms",
      retryCount: 3,
      maxRetries: 3,
      workerId: "worker_1292",
      executionTimeMs: 24000,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      user: { name: "Ajay Creator", email: "ajay@creatoros.ai" },
    },
  ];
};
