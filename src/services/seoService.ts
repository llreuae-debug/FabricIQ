// FabricIQ SEO, AEO, and AIO Metadata Service
// Visible brand remains: FabricIQ
// Technical / Canonical domain: https://fabriciqcost.com/

export interface PageMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
  breadcrumbs?: { name: string; path: string }[];
  faqItems?: { question: string; answer: string }[];
}

export const BASE_DOMAIN = 'https://fabriciqcost.com';

export const DEFAULT_METADATA: Record<string, PageMetadata> = {
  dashboard: {
    title: 'FabricIQ | Smart Textile Costing & Live Market Intelligence',
    description: 'FabricIQ helps textile professionals calculate fabric costs, analyze yarn and processing costs, monitor live market rates, and create professional estimates.',
    canonicalPath: '/',
    keywords: [
      'textile costing software',
      'fabric costing calculator',
      'fabric cost calculator',
      'textile cost calculator',
      'textile market rates',
      'textile quotation software',
      'grey fabric costing'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' }
    ]
  },
  calculator: {
    title: 'Textile Cost Calculator | FabricIQ',
    description: 'Calculate yarn, weaving, processing, dyeing, printing, logistics, margin, and tax costs with the FabricIQ deterministic textile costing calculator.',
    canonicalPath: '/calculator',
    keywords: [
      'textile costing calculator',
      'fabric costing calculator',
      'yarn costing calculator',
      'weaving cost calculator',
      'dyeing cost calculator',
      'textile processing cost calculator',
      'fabric price calculator'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Cost Calculator', path: '/calculator' }
    ]
  },
  market_rates: {
    title: 'Live Textile Market Rates | FabricIQ',
    description: 'Track verified live USD/PKR exchange rates, yarn benchmark indices, and raw commodity prices with timestamped snapshot audits on FabricIQ.',
    canonicalPath: '/market-rates',
    keywords: [
      'textile market rates',
      'cotton yarn rates',
      'usd to pkr textile rate',
      'yarn price benchmark',
      'textile commodity index'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Market Rates', path: '/market-rates' }
    ]
  },
  saved_estimates: {
    title: 'Saved Quotations & Cost Estimates | FabricIQ',
    description: 'Access, manage, and export verified textile cost estimates, commercial quotations, and formula audit logs on FabricIQ.',
    canonicalPath: '/estimates',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Estimates', path: '/estimates' }
    ]
  },
  utilities: {
    title: 'Textile Engineering Tools & Formula Calculators | FabricIQ',
    description: 'Convert English Count (Ne), Denier, Tex, and Nm, calculate fabric GSM, analyze warp/weft crimp, and optimize loom economics with FabricIQ tools.',
    canonicalPath: '/tools',
    keywords: [
      'yarn count conversion',
      'fabric gsm calculator',
      'warp weft crimp calculator',
      'textile engineering tools'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Textile Tools', path: '/tools' }
    ]
  },
  about: {
    title: 'About FabricIQ | Textile Costing Technology & Deterministic Engine',
    description: 'Learn about FabricIQ’s mission to deliver mathematical precision, transparent formula audits, and live market intelligence to the global textile supply chain.',
    canonicalPath: '/about',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' }
    ]
  },
  features: {
    title: 'FabricIQ Features & 8-Stage Manufacturing Costing Engine',
    description: 'Explore FabricIQ’s 8-stage textile manufacturing engine covering physical specs, compound yield losses, loom economics, color printing, and PDF quotations.',
    canonicalPath: '/features',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Features', path: '/features' }
    ]
  },
  knowledge: {
    title: 'Textile Costing Knowledge Base & Technical Guides | FabricIQ',
    description: 'Expert-level technical articles on fabric costing mathematics, GSM physics, loom pick rates, screen engraving amortization, and compound yield compounding.',
    canonicalPath: '/textile-costing-guide',
    keywords: [
      'textile costing guide',
      'fabric cost calculation',
      'yarn costing formulas',
      'weaving economics',
      'dyeing costing',
      'printing costing'
    ],
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Knowledge Base', path: '/textile-costing-guide' }
    ]
  },
  pricing: {
    title: 'FabricIQ Pricing & Membership Rewards',
    description: 'Explore FabricIQ membership tiers. Enjoy complete free deterministic costing or unlock unlimited quotes and exports through our Invite & Earn program.',
    canonicalPath: '/pricing',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Pricing', path: '/pricing' }
    ]
  },
  contact: {
    title: 'Contact FabricIQ | Textile Engineering Support & Enterprise',
    description: 'Contact the FabricIQ engineering team for formula inquiries, enterprise mill server licensing, publisher partnerships, and technical support.',
    canonicalPath: '/contact',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ]
  },
  faq: {
    title: 'FabricIQ FAQ | Textile Costing & Market Rates',
    description: 'Direct answers to frequently asked questions regarding fabric cost calculations, compound yield formulas, yarn consumption, and offline PWA usage.',
    canonicalPath: '/faq',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' }
    ],
    faqItems: [
      {
        question: 'What is textile costing?',
        answer: 'Textile costing is the comprehensive mathematical process of computing all direct and indirect expenses required to manufacture fabric, including raw yarn, weaving conversion, preparatory sizing, wet processing, dyeing, printing, finishing, packaging, logistics, commercial overhead, margin, and applicable sales taxes.'
      },
      {
        question: 'How is fabric cost calculated per meter?',
        answer: 'Fabric cost per meter is calculated by summing Warp Yarn Cost/m + Weft Yarn Cost/m + Weaving/Knitting Conversion Cost/m + Chemical Processing/Dyeing Cost/m + Printing/Screen Amortization/m + Finishing Cost/m + Packaging/Freight Cost/m, then adjusting for compound yield recovery losses and applying commercial margin.'
      },
      {
        question: 'How is yarn consumption calculated for woven fabric?',
        answer: 'Warp yarn consumption (g/m) = (EPI × Reed Width (inches) × (1 + Warp Crimp%) × (1 + Warp Waste%)) / (Warp Count Ne × 1.693). Weft yarn consumption (g/m) = (PPI × Reed Width (inches) × (1 + Weft Crimp%) × (1 + Weft Waste%)) / (Weft Count Ne × 1.693).'
      },
      {
        question: 'What is the difference between markup and margin in textile pricing?',
        answer: 'Margin is the percentage of the selling price that is profit: Selling Price = Total Cost / (1 - Margin%). Markup is the percentage added directly onto the cost: Selling Price = Total Cost × (1 + Markup%). Decoupling margin from markup prevents quoting contracts at a loss.'
      },
      {
        question: 'How does textile costing software work in FabricIQ?',
        answer: 'FabricIQ uses a deterministic costing engine: physical inputs and verified market rates flow sequentially through mathematical formulas to generate intermediate stage totals, compound yields, and penny-precise final quotations with timestamped snapshot audits.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy | FabricIQ',
    description: 'FabricIQ’s privacy commitments, data processing rules, cookie usage, Google services compliance, and user rights under GDPR and CCPA.',
    canonicalPath: '/privacy',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy' }
    ]
  },
  terms: {
    title: 'Terms & Conditions | FabricIQ',
    description: 'Terms of service, deterministic calculation disclaimers, account usage terms, and intellectual property rights for the FabricIQ platform.',
    canonicalPath: '/terms',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms', path: '/terms' }
    ]
  },
  cookies: {
    title: 'Cookie Policy | FabricIQ',
    description: 'Learn how FabricIQ uses strictly necessary, analytics, and advertising cookies to support accurate calculations and publisher compliance.',
    canonicalPath: '/cookies',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Cookie Policy', path: '/cookies' }
    ]
  },
  disclaimer: {
    title: 'Market Data & Calculation Disclaimer | FabricIQ',
    description: 'Full transparency regarding market rate benchmarks, mill operational variations, currency volatility, and deterministic mathematical modeling.',
    canonicalPath: '/disclaimer',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Market Disclaimer', path: '/disclaimer' }
    ]
  }
};

class SeoService {
  public updatePageMetadata(tabKey: string, custom?: Partial<PageMetadata>): void {
    if (typeof document === 'undefined') return;

    const meta = { ...(DEFAULT_METADATA[tabKey] || DEFAULT_METADATA.dashboard), ...custom };
    const fullCanonicalUrl = `${BASE_DOMAIN}${meta.canonicalPath === '/' ? '' : meta.canonicalPath}`;

    // 1. Update Title Tag
    document.title = meta.title;

    // 2. Update Meta Description
    this.setMetaTag('name', 'description', meta.description);

    // 3. Update Meta Keywords
    if (meta.keywords && meta.keywords.length > 0) {
      this.setMetaTag('name', 'keywords', meta.keywords.join(', '));
    }

    // 4. Update Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullCanonicalUrl;

    // 5. Update Open Graph Meta Tags
    this.setMetaTag('property', 'og:title', meta.title);
    this.setMetaTag('property', 'og:description', meta.description);
    this.setMetaTag('property', 'og:url', fullCanonicalUrl);
    this.setMetaTag('property', 'og:site_name', 'FabricIQ');
    this.setMetaTag('property', 'og:type', meta.ogType || 'website');
    this.setMetaTag('property', 'og:image', `${BASE_DOMAIN}/logo.png`);
    this.setMetaTag('property', 'og:image:width', '1200');
    this.setMetaTag('property', 'og:image:height', '630');
    this.setMetaTag('property', 'og:locale', 'en_US');

    // 6. Update Twitter Meta Tags
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', meta.title);
    this.setMetaTag('name', 'twitter:description', meta.description);
    this.setMetaTag('name', 'twitter:url', fullCanonicalUrl);
    this.setMetaTag('name', 'twitter:image', `${BASE_DOMAIN}/logo.png`);

    // 7. Update JSON-LD Structured Data
    this.updateStructuredData(meta, fullCanonicalUrl);
  }

  private setMetaTag(attrName: 'name' | 'property', attrValue: string, contentValue: string): void {
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attrName, attrValue);
      document.head.appendChild(tag);
    }
    tag.content = contentValue;
  }

  private updateStructuredData(meta: PageMetadata, fullCanonicalUrl: string): void {
    let scriptTag = document.getElementById('fabriciq-schema-jsonld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'fabriciq-schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaGraph: any[] = [
      {
        '@type': 'Organization',
        '@id': `${BASE_DOMAIN}/#org`,
        name: 'FabricIQ',
        url: `${BASE_DOMAIN}/`,
        logo: `${BASE_DOMAIN}/logo.png`,
        description: 'Smart Textile Costing & Live Market Intelligence platform for global spinning, weaving, and apparel manufacturing.',
        sameAs: []
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_DOMAIN}/#website`,
        url: `${BASE_DOMAIN}/`,
        name: 'FabricIQ',
        description: 'Smart Textile Costing. Live Market Intelligence.',
        publisher: { '@id': `${BASE_DOMAIN}/#org` }
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${BASE_DOMAIN}/#app`,
        name: 'FabricIQ',
        operatingSystem: 'All (Web, iOS, Android, Windows, macOS)',
        applicationCategory: 'BusinessApplication',
        description: 'Deterministic fabric costing engine, live USD/PKR market rates, and formula audit trail reports.',
        url: fullCanonicalUrl,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }
    ];

    // Add BreadcrumbList if available
    if (meta.breadcrumbs && meta.breadcrumbs.length > 0) {
      schemaGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: meta.breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: `${BASE_DOMAIN}${b.path === '/' ? '' : b.path}`
        }))
      });
    }

    // Add FAQPage Schema if visible FAQs exist
    if (meta.faqItems && meta.faqItems.length > 0) {
      schemaGraph.push({
        '@type': 'FAQPage',
        mainEntity: meta.faqItems.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      });
    }

    scriptTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': schemaGraph
    });
  }
}

export const seoService = new SeoService();
