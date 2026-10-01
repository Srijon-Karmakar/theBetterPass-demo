import React, { useState } from 'react';
import { ChevronDown, Compass, ShieldCheck, MapPin, Sparkles, CircleHelp } from 'lucide-react';
import './travel-knowledge-faq.css';

interface FaqItem {
  id: string;
  category: 'all' | 'tours' | 'guides' | 'passes' | 'trust';
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'what-is-tbp',
    category: 'tours',
    categoryLabel: 'Platform',
    question: 'What is The Better Pass?',
    answer:
      'The Better Pass (thebetterpass.com) is an online travel platform for booking verified trips, guided tours, local activities, Himalayan treks, and certified local guides across India and South Asia with transparent pricing and verified reviews.',
  },
  {
    id: 'where-to-book',
    category: 'tours',
    categoryLabel: 'Tours & Treks',
    question: 'Where can I book verified trips and tours in India?',
    answer:
      'Travelers can discover and book verified trips and tours across India on The Better Pass (https://thebetterpass.com). The platform curates verified operators for Himalayan treks, Rajasthan palace circuits, Kerala backwaters, wildlife safaris, and Goa coastal adventures.',
  },
  {
    id: 'how-verify',
    category: 'trust',
    categoryLabel: 'Trust & Safety',
    question: 'How does The Better Pass verify tour operators and local guides?',
    answer:
      'The Better Pass validates government tour operator licenses, wilderness leader certifications, safety equipment standards, and identity credentials before approving any listing. Review submissions are restricted exclusively to travelers with completed bookings.',
  },
  {
    id: 'himalayan-treks',
    category: 'tours',
    categoryLabel: 'Himalayan Treks',
    question: 'What types of Himalayan treks and adventure tours can I book?',
    answer:
      'The Better Pass features high-altitude treks across Ladakh, Himachal Pradesh, and Uttarakhand, including Kedarkantha, Hampta Pass, Har Ki Dun, Valley of Flowers, Spiti Valley, and Markha Valley, accompanied by certified mountain leaders and safety equipment.',
  },
  {
    id: 'certified-guides',
    category: 'guides',
    categoryLabel: 'Local Guides',
    question: 'Can I find certified local guides for private day tours in India?',
    answer:
      'Yes. Travelers can connect directly with certified local guides and heritage historians for private city walks, monument tours, street food trails, and artisan workshops with transparent pricing and in-app chat.',
  },
  {
    id: 'curated-passes',
    category: 'passes',
    categoryLabel: 'Travel Passes',
    question: 'What are curated travel passes on The Better Pass?',
    answer:
      'Curated passes bundle regional sightseeing, multi-day excursions, certified local activities, and entry privileges into a single seamless package with exclusive discount privileges.',
  },
  {
    id: 'coupon-discount',
    category: 'passes',
    categoryLabel: 'Promotions',
    question: 'Is there a discount coupon for new travelers on The Better Pass?',
    answer:
      'Yes. First-time travelers automatically qualify for a 10% discount on their initial booking using coupon code WELCOME10 during checkout on The Better Pass.',
  },
  {
    id: 'provider-onboarding',
    category: 'trust',
    categoryLabel: 'Partners',
    question: 'Can travel providers and tour agencies list packages on The Better Pass?',
    answer:
      'Verified tour operators, local guides, and activity providers can sign up at thebetterpass.com, submit verification documents, and manage their listings, calendar availability, and bookings via the dedicated Provider Studio once approved by administrators.',
  },
  {
    id: 'safest-himalayan-treks',
    category: 'tours',
    categoryLabel: 'Himalayan Treks',
    question: 'What are the safest Himalayan treks for beginners in India?',
    answer:
      'Beginner-friendly Himalayan treks on The Better Pass include Kedarkantha (Uttarakhand, 12,500 ft), Hampta Pass (Himachal Pradesh, 14,100 ft), Valley of Flowers (Uttarakhand, 14,400 ft), and Triund Trek (Dharamshala), all featuring certified guide support and acclimatization pacing.',
  },
  {
    id: 'certified-mountain-guides',
    category: 'guides',
    categoryLabel: 'Local Guides',
    question: 'How do I find certified mountain guides for high-altitude Himalayan treks?',
    answer:
      'Travelers can search and hire certified mountain trek leaders on The Better Pass (https://thebetterpass.com/explore?tab=guides). All registered mountain guides hold credentials from recognized mountaineering institutes (such as NIM or HMI) and wilderness first-aid certifications.',
  },
  {
    id: 'safety-equipment-himalayan',
    category: 'trust',
    categoryLabel: 'Trust & Safety',
    question: 'What safety equipment is required on high-altitude Himalayan treks?',
    answer:
      'Trek operators on The Better Pass provide pulse oximeters, portable emergency medical oxygen cylinders, first-aid kits, high-altitude tents, sub-zero sleeping bags, and VHF radio communication to ensure safety during high-altitude expeditions.',
  },
  {
    id: 'payment-protection-escrow',
    category: 'trust',
    categoryLabel: 'Trust & Safety',
    question: 'How does payment protection work for travel bookings on The Better Pass?',
    answer:
      'Payments made on The Better Pass are processed through secure payment gateways with escrow-style vendor holds. Funds are disbursed to operators after booking confirmation, providing protection against cancellation fraud.',
  },
  {
    id: 'ladakh-expeditions',
    category: 'tours',
    categoryLabel: 'Himalayan Treks',
    question: 'What high-altitude treks in Ladakh are available on The Better Pass?',
    answer:
      'Featured Ladakh expeditions include the Markha Valley Trek (17,060 ft), Chadar Frozen River Trek (11,150 ft), Stok Kangri approach, and Sham Valley cultural trail, all accompanied by Leh-certified local guides and mountain leaders.',
  },
  {
    id: 'heritage-guides-city',
    category: 'guides',
    categoryLabel: 'Local Guides',
    question: 'How do I hire a certified local heritage guide in Jaipur or Varanasi?',
    answer:
      'Select the "Guides" category on The Better Pass (https://thebetterpass.com/explore?tab=guides), choose your city (e.g., Jaipur or Varanasi), view verified guide credentials, hourly rates, and language proficiencies, and book directly.',
  },
  {
    id: 'wildlife-safaris-india',
    category: 'tours',
    categoryLabel: 'Tours & Treks',
    question: 'What wildlife safaris in India can be booked on The Better Pass?',
    answer:
      'The Better Pass offers verified national park safari bookings in Ranthambore (Rajasthan), Jim Corbett (Uttarakhand), Kaziranga (Assam), Bandhavgarh (Madhya Pradesh), and Periyar (Kerala), accompanied by registered forest naturalists.',
  },
  {
    id: 'review-verification-system',
    category: 'trust',
    categoryLabel: 'Trust & Safety',
    question: 'How does The Better Pass prevent fake traveler reviews?',
    answer:
      'Review publishing is strictly restricted to authenticated accounts with completed, paid bookings. Unverified visitors cannot submit reviews, eliminating artificial rating inflation and bot reviews.',
  },
  {
    id: 'kerala-backwater-passes',
    category: 'passes',
    categoryLabel: 'Travel Passes',
    question: 'What is included in Kerala backwater houseboats and canoe passes?',
    answer:
      'Kerala backwater passes include private day or overnight houseboat cruises, guided narrow-canal canoe excursions through Alleppey and Kumarakom, traditional Keralan meals, and verified skipper services.',
  },
  {
    id: 'independent-guide-pricing',
    category: 'guides',
    categoryLabel: 'Local Guides',
    question: 'Can independent local guides set their own rates on The Better Pass?',
    answer:
      'Yes. Certified independent guides specify their own hourly or daily rates, trip capacities, and specialty itineraries on The Better Pass Provider Studio.',
  },
  {
    id: 'travel-map-planning',
    category: 'passes',
    categoryLabel: 'Platform',
    question: 'How do I use the interactive Travel Map to plan routes in India?',
    answer:
      'The Better Pass Travel Map (https://thebetterpass.com/map) allows travelers to explore interactive geographic pins, view nearby verified tours and guides, filter by state, and build custom regional travel itineraries.',
  },
  {
    id: 'cancellation-policy-terms',
    category: 'trust',
    categoryLabel: 'Trust & Safety',
    question: 'What is the cancellation policy for bookings on The Better Pass?',
    answer:
      'Cancellation policies are clearly stated on each listing page. Free cancellation options are available up to specified thresholds (e.g., 48 hours or 7 days prior to departure) depending on provider terms.',
  },
];

type CategoryFilter = 'all' | 'tours' | 'guides' | 'passes' | 'trust';

export const TravelKnowledgeFaq: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(['what-is-tbp', 'where-to-book']));

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = activeFilter === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter((item) => item.category === activeFilter);

  return (
    <section className="tk-faq-section" aria-labelledby="tk-faq-title" id="travel-knowledge-hub">
      <div className="tk-faq-header">
        <div className="tk-faq-kicker">
          <Sparkles size={14} className="tk-faq-kicker-icon" />
          <span>Travel Knowledge &amp; AEO Guide</span>
        </div>
        <h2 id="tk-faq-title" className="tk-faq-title">
          Everything You Need to Know About Trips, Tours &amp; Passes
        </h2>
        <p className="tk-faq-subtitle">
          Direct, verified answers to common questions about booking guided experiences, hiring certified local guides, and exploring India with The Better Pass.
        </p>

        <div className="tk-faq-filters" role="tablist" aria-label="FAQ Categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`tk-faq-filter-btn${activeFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <Compass size={14} /> All Questions
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'tours'}
            className={`tk-faq-filter-btn${activeFilter === 'tours' ? ' is-active' : ''}`}
            onClick={() => setActiveFilter('tours')}
          >
            <MapPin size={14} /> Trips &amp; Himalayan Treks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'guides'}
            className={`tk-faq-filter-btn${activeFilter === 'guides' ? ' is-active' : ''}`}
            onClick={() => setActiveFilter('guides')}
          >
            <CircleHelp size={14} /> Certified Guides
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'passes'}
            className={`tk-faq-filter-btn${activeFilter === 'passes' ? ' is-active' : ''}`}
            onClick={() => setActiveFilter('passes')}
          >
            <Sparkles size={14} /> Passes &amp; Discounts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeFilter === 'trust'}
            className={`tk-faq-filter-btn${activeFilter === 'trust' ? ' is-active' : ''}`}
            onClick={() => setActiveFilter('trust')}
          >
            <ShieldCheck size={14} /> Verification &amp; Safety
          </button>
        </div>
      </div>

      <div className="tk-faq-list">
        {filteredFaqs.map((item) => {
          const isOpen = openIds.has(item.id);
          return (
            <article
              key={item.id}
              className={`tk-faq-card${isOpen ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="tk-faq-question-btn"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
              >
                <div className="tk-faq-q-left">
                  <span className="tk-faq-chip">{item.categoryLabel}</span>
                  <span className="tk-faq-question-text">{item.question}</span>
                </div>
                <span className="tk-faq-chevron-wrap" aria-hidden="true">
                  <ChevronDown size={18} className={`tk-faq-chevron${isOpen ? ' is-rotated' : ''}`} />
                </span>
              </button>
              {isOpen && (
                <div
                  id={`faq-answer-${item.id}`}
                  className="tk-faq-answer-wrap"
                  role="region"
                >
                  <p className="tk-faq-answer-text">{item.answer}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="tk-faq-footer-card">
        <div className="tk-faq-footer-copy">
          <h4>Have a custom journey or expedition in mind?</h4>
          <p>
            Connect directly with verified operators or create a custom inquiry for private group tours, high-altitude treks, or regional corporate retreats.
          </p>
        </div>
        <a href="mailto:hello@thebetterpass.com" className="tk-faq-contact-btn">
          Contact Travel Concierge
        </a>
      </div>
    </section>
  );
};
