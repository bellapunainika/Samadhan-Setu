// English & Hindi language translations — fully expanded for all UI strings

export const TRANSLATIONS = {
  en: {
    appName: "Samadhan Setu",
    tagline: "Societal Innovation Collaboration Portal",
    govtAffiliation: "Government of Jharkhand",
    heroTitle: "Transforming Jharkhand's Societal Challenges into Scalable Innovations",
    heroSubtitle: "A statewide AI-enabled platform crowdsourcing citizen problems and orchestrating collaborative problem-solving across premier universities and industry CSR partners.",
    submitProblemBtn: "Submit a Challenge",
    exploreHeatmapBtn: "Explore GIS Heatmap",
    switchRole: "Switch Role",

    stats: {
      totalProblems: "Problems Reported",
      solvedProblems: "Challenges Solved",
      activeUniversities: "Partner Universities",
      industryPartners: "Industry MoUs Signed",
      csrFunds: "CSR Capital Mobilized",
      citizensImpacted: "Citizens Impacted"
    },

    roles: {
      citizen: "Citizen / Community",
      university: "University / Faculty / Student",
      industry: "Industry / CSR Partner",
      admin: "Govt Admin / Executive"
    },

    nav: {
      home: "Home",
      submit: "Submit Problem",
      heatmap: "GIS Urgency Heatmap",
      stateAnalytics: "State Analytics",
      citizenPortal: "Citizen Portal",
      universityPortal: "University Portal",
      industryPortal: "Industry Portal",
      adminAnalytics: "Admin Panel",
      login: "Login",
      logout: "Logout",
      notifications: "Notifications",
      language: "हिं",
      switchRoleLabel: "Switch Role",
      loggedInAs: "Logged in as"
    },

    login: {
      modalTitle: "Sign in to Samadhan Setu",
      modalSubtitle: "Choose your stakeholder role to access your personalised dashboard and collaborative workspace.",
      whoAreYou: "Who are you signing in as?",
      citizenTitle: "Citizen",
      citizenDesc: "Submit challenges, track resolutions, upvote local issues.",
      universityTitle: "University",
      universityDesc: "Browse AI-routed problems, manage R&D Kanban, submit prototypes.",
      industryTitle: "Industry Partner",
      industryDesc: "Discover validated prototypes, pledge CSR funds, sign MoUs.",
      adminTitle: "Government Admin",
      adminDesc: "Statewide oversight, manual overrides, moderation, report exports.",
      formTitle: "Enter your credentials",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      continueBtn: "Continue →",
      backBtn: "← Back",
      demoCreds: "Demo credentials",
      invalidCreds: "Incorrect credentials. Please use the demo credentials shown above.",
      successToast: "Login Successful",
      successMsg: "Welcome! You are now signed in.",
      logoutToast: "Logged Out",
      logoutMsg: "You have been signed out successfully.",
      credentialHint: "Use email"
    },

    otp: {
      title: "Quick Verification Required",
      subtitle: "Enter your mobile number to submit a challenge. A mock OTP will be sent.",
      phonePlaceholder: "e.g. +91 98765 43210",
      otpPlaceholder: "Enter OTP (any 6 digits)",
      sendOtp: "Send OTP",
      verify: "Verify & Continue",
      skip: "Skip — Demo Mode",
      invalidOtp: "OTP must be 6 digits."
    },

    stateAnalytics: {
      pageTitle: "State Analytics & Public Transparency Dashboard",
      pageSubtitle: "Live accountability data — which university is solving what, which industry is funding what, and the current status of every registered challenge across Jharkhand.",
      publicBadge: "Public Transparency Portal — No Login Required",
      projectExplorer: "Project Explorer",
      projectExplorerSubtitle: "Browse all registered challenges, their assigned solvers, and current status. Click 'View Full Project' to see internal details (login required).",
      viewFullProject: "View Full Project",
      loginToViewDetails: "Login to view internal project details (Kanban, documents, contacts)",
      assignedUniversity: "Assigned University",
      assignedIndustry: "Industry Partner",
      publicStatus: "Status",
      outcomeLabel: "Outcome Summary",
      noOutcomeYet: "Research in progress — outcome pending.",
      searchPlaceholder: "Search by problem, university, district...",
      allStatuses: "All Statuses",
      filterByCategory: "All Categories"
    },

    admin: {
      pageTitle: "Government Admin Control Panel",
      pageSubtitle: "Internal administrative tool for state nodal officers. Full drill-down access, override controls, and compliance reporting.",
      accessDenied: "Access Denied",
      accessDeniedMsg: "This panel is only accessible to Government Admin accounts.",
      loginAsAdmin: "Login as Admin",
      sidebar: {
        dashboard: "Dashboard",
        pipeline: "Project Pipeline",
        partners: "Partner Management",
        moderation: "Moderation Queue",
        reports: "Report Export"
      },
      pipeline: {
        title: "All Jharkhand Challenges (State Administrative Table)",
        subtitle: "Audit AI categorization, reassign universities, or override priority weights.",
        reassign: "Reassign University",
        overrideUrgency: "Override Urgency",
        approve: "Approve",
        reject: "Reject",
        overrideTitle: "Manual Override",
        reassignSuccess: "University Reassigned",
        urgencyOverrideSuccess: "Urgency Score Updated"
      },
      partners: {
        title: "Verified Partners Directory",
        subtitle: "All verified universities and industry partners. Manage onboarding and verification status.",
        addPartner: "Add / Verify New Partner",
        universities: "Universities",
        industry: "Industry Partners",
        verified: "Verified",
        pending: "Pending Verification"
      },
      moderation: {
        title: "Moderation Queue",
        subtitle: "Submissions flagged as duplicate, spam, or requiring manual review before routing.",
        flaggedDuplicate: "Flagged: Duplicate",
        flaggedSpam: "Flagged: Spam",
        flaggedSensitive: "Flagged: Sensitive Content",
        approveAndRoute: "Approve & Route",
        markDuplicate: "Mark Duplicate",
        dismiss: "Dismiss"
      },
      reports: {
        title: "Compliance Report Export",
        subtitle: "Generate formatted policy briefings and raw telemetry data for district collectors.",
        exportPDF: "Export PDF Briefing",
        exportCSV: "Export GIS Dataset (CSV)",
        exportExcel: "Export Partner MoU Registry (Excel)",
        generating: "Generating report…"
      }
    },

    filters: {
      allCategories: "All Categories",
      allDistricts: "All 24 Districts",
      allStatuses: "All Statuses",
      filterByCategory: "Filter by Category",
      filterByUrgency: "Filter by Urgency",
      searchPlaceholder: "Search by keyword, district, or village..."
    },

    common: {
      backToHome: "Back to Home",
      viewDetails: "View Details",
      status: "Status",
      district: "District",
      category: "Category",
      urgency: "Urgency",
      loading: "Loading…",
      noResults: "No results found.",
      submitSuccess: "Submitted successfully!"
    }
  },

  hi: {
    appName: "समाधान सेतु",
    tagline: "सामाजिक नवाचार सहयोग पोर्टल",
    govtAffiliation: "झारखंड सरकार • स्मार्ट इंडिया हैकथॉन 2026",
    heroTitle: "झारखंड की जमीनी समस्याओं का स्थायी समाधान और नवाचार",
    heroSubtitle: "नागरिकों द्वारा उठाई गई समस्याओं को AI द्वारा विश्लेषण कर विश्वविद्यालयों और औद्योगिक साझेदारों के साथ मिलकर वैज्ञानिक समाधान तैयार करने का राज्यव्यापी डिजिटल मंच।",
    submitProblemBtn: "समस्या दर्ज करें",
    exploreHeatmapBtn: "GIS हीटमैप देखें",
    switchRole: "भूमिका बदलें",

    stats: {
      totalProblems: "कुल दर्ज समस्याएं",
      solvedProblems: "समाधानित चुनौतियाँ",
      activeUniversities: "संबद्ध विश्वविद्यालय",
      industryPartners: "हस्ताक्षरित MoU",
      csrFunds: "जुटाया गया CSR फंड",
      citizensImpacted: "प्रभावित नागरिक"
    },

    roles: {
      citizen: "नागरिक / समुदाय",
      university: "विश्वविद्यालय / प्राध्यापक",
      industry: "उद्योग / CSR साझेदार",
      admin: "सरकारी नोडल अधिकारी"
    },

    nav: {
      home: "होम",
      submit: "समस्या दर्ज करें",
      heatmap: "GIS हीटमैप",
      stateAnalytics: "राज्य विश्लेषण",
      citizenPortal: "नागरिक पोर्टल",
      universityPortal: "विश्वविद्यालय पोर्टल",
      industryPortal: "उद्योग पोर्टल",
      adminAnalytics: "एडमिन पैनल",
      login: "लॉगिन",
      logout: "लॉगआउट",
      notifications: "सूचनाएं",
      language: "EN",
      switchRoleLabel: "भूमिका बदलें",
      loggedInAs: "लॉगिन किया"
    },

    login: {
      modalTitle: "समाधान सेतु में साइन इन करें",
      modalSubtitle: "अपना हितधारक रोल चुनें और व्यक्तिगत डैशबोर्ड एवं सहयोगी कार्यक्षेत्र तक पहुँचें।",
      whoAreYou: "आप किस रूप में साइन इन कर रहे हैं?",
      citizenTitle: "नागरिक",
      citizenDesc: "चुनौतियाँ दर्ज करें, समाधान ट्रैक करें, स्थानीय मुद्दों को समर्थन दें।",
      universityTitle: "विश्वविद्यालय",
      universityDesc: "AI-राउटेड समस्याएं देखें, Kanban प्रबंधित करें, प्रोटोटाइप सबमिट करें।",
      industryTitle: "उद्योग साझेदार",
      industryDesc: "प्रमाणित प्रोटोटाइप खोजें, CSR फंड प्रतिज्ञा करें, MoU साइन करें।",
      adminTitle: "सरकारी एडमिन",
      adminDesc: "राज्यव्यापी निगरानी, मैन्युअल ओवरराइड, मॉडरेशन, रिपोर्ट निर्यात।",
      formTitle: "अपना विवरण दर्ज करें",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      continueBtn: "आगे बढ़ें →",
      backBtn: "← वापस",
      demoCreds: "डेमो क्रेडेंशियल",
      invalidCreds: "गलत क्रेडेंशियल। ऊपर दिखाए गए डेमो क्रेडेंशियल उपयोग करें।",
      successToast: "लॉगिन सफल",
      successMsg: "आपका स्वागत है! आप सफलतापूर्वक साइन इन हुए।",
      logoutToast: "लॉगआउट",
      logoutMsg: "आप सफलतापूर्वक साइन आउट हो गए।",
      credentialHint: "ईमेल उपयोग करें"
    },

    otp: {
      title: "त्वरित सत्यापन आवश्यक",
      subtitle: "चुनौती दर्ज करने के लिए मोबाइल नंबर दर्ज करें। एक मॉक OTP भेजा जाएगा।",
      phonePlaceholder: "जैसे +91 98765 43210",
      otpPlaceholder: "OTP दर्ज करें (कोई भी 6 अंक)",
      sendOtp: "OTP भेजें",
      verify: "सत्यापित करें और आगे बढ़ें",
      skip: "छोड़ें — डेमो मोड",
      invalidOtp: "OTP 6 अंकों का होना चाहिए।"
    },

    stateAnalytics: {
      pageTitle: "राज्य विश्लेषण एवं सार्वजनिक पारदर्शिता डैशबोर्ड",
      pageSubtitle: "लाइव जवाबदेही डेटा — कौन सा विश्वविद्यालय क्या हल कर रहा है, कौन सा उद्योग क्या फंड कर रहा है।",
      publicBadge: "सार्वजनिक पारदर्शिता पोर्टल — लॉगिन आवश्यक नहीं",
      projectExplorer: "प्रोजेक्ट एक्सप्लोरर",
      projectExplorerSubtitle: "सभी पंजीकृत चुनौतियाँ, उनके निर्धारित समाधानकर्ता और वर्तमान स्थिति देखें।",
      viewFullProject: "पूरा प्रोजेक्ट देखें",
      loginToViewDetails: "आंतरिक विवरण देखने के लिए लॉगिन करें",
      assignedUniversity: "निर्धारित विश्वविद्यालय",
      assignedIndustry: "उद्योग साझेदार",
      publicStatus: "स्थिति",
      outcomeLabel: "परिणाम सारांश",
      noOutcomeYet: "शोध जारी — परिणाम प्रतीक्षित।",
      searchPlaceholder: "समस्या, विश्वविद्यालय, जिला खोजें...",
      allStatuses: "सभी स्थितियां",
      filterByCategory: "सभी श्रेणियां"
    },

    admin: {
      pageTitle: "सरकारी एडमिन नियंत्रण पैनल",
      pageSubtitle: "राज्य नोडल अधिकारियों के लिए आंतरिक प्रशासनिक टूल।",
      accessDenied: "पहुँच अस्वीकृत",
      accessDeniedMsg: "यह पैनल केवल सरकारी एडमिन खातों के लिए सुलभ है।",
      loginAsAdmin: "एडमिन के रूप में लॉगिन करें",
      sidebar: {
        dashboard: "डैशबोर्ड",
        pipeline: "प्रोजेक्ट पाइपलाइन",
        partners: "साझेदार प्रबंधन",
        moderation: "मॉडरेशन कतार",
        reports: "रिपोर्ट निर्यात"
      },
      pipeline: {
        title: "सभी झारखंड चुनौतियाँ (राज्य प्रशासनिक तालिका)",
        subtitle: "AI वर्गीकरण की जाँच करें, विश्वविद्यालय पुन: आवंटित करें, या प्राथमिकता भार ओवरराइड करें।",
        reassign: "विश्वविद्यालय बदलें",
        overrideUrgency: "तात्कालिकता ओवरराइड करें",
        approve: "स्वीकृत करें",
        reject: "अस्वीकृत करें",
        overrideTitle: "मैन्युअल ओवरराइड",
        reassignSuccess: "विश्वविद्यालय पुनः आवंटित",
        urgencyOverrideSuccess: "तात्कालिकता स्कोर अपडेट"
      },
      partners: {
        title: "सत्यापित साझेदार निर्देशिका",
        subtitle: "सभी सत्यापित विश्वविद्यालय और उद्योग साझेदार।",
        addPartner: "नया साझेदार जोड़ें / सत्यापित करें",
        universities: "विश्वविद्यालय",
        industry: "उद्योग साझेदार",
        verified: "सत्यापित",
        pending: "सत्यापन प्रतीक्षित"
      },
      moderation: {
        title: "मॉडरेशन कतार",
        subtitle: "डुप्लिकेट, स्पैम, या मैन्युअल समीक्षा के लिए फ्लैग किए गए सबमिशन।",
        flaggedDuplicate: "फ्लैग: डुप्लिकेट",
        flaggedSpam: "फ्लैग: स्पैम",
        flaggedSensitive: "फ्लैग: संवेदनशील सामग्री",
        approveAndRoute: "स्वीकृत करें और रूट करें",
        markDuplicate: "डुप्लिकेट चिह्नित करें",
        dismiss: "खारिज करें"
      },
      reports: {
        title: "अनुपालन रिपोर्ट निर्यात",
        subtitle: "जिला कलेक्टरों के लिए नीति ब्रीफिंग और कच्चे टेलीमेट्री डेटा जनरेट करें।",
        exportPDF: "PDF ब्रीफिंग निर्यात करें",
        exportCSV: "GIS डेटासेट (CSV) निर्यात करें",
        exportExcel: "MoU रजिस्ट्री (Excel) निर्यात करें",
        generating: "रिपोर्ट जनरेट हो रही है…"
      }
    },

    filters: {
      allCategories: "सभी श्रेणियां",
      allDistricts: "सभी 24 जिले",
      allStatuses: "सभी स्थितियां",
      filterByCategory: "श्रेणी अनुसार फ़िल्टर",
      filterByUrgency: "प्राथमिकता अनुसार",
      searchPlaceholder: "कीवर्ड, जिला या गांव खोजें..."
    },

    common: {
      backToHome: "होम पर वापस",
      viewDetails: "विवरण देखें",
      status: "स्थिति",
      district: "जिला",
      category: "श्रेणी",
      urgency: "तात्कालिकता",
      loading: "लोड हो रहा है…",
      noResults: "कोई परिणाम नहीं मिला।",
      submitSuccess: "सफलतापूर्वक सबमिट किया!"
    }
  }
};
