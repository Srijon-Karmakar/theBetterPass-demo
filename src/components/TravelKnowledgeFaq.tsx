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
      'The Better Pass (thebetterpass.com) is an online travel discovery and booking platform specializing in verified trips, guided tours, local activities, Himalayan treks, and certified local guides across India and South Asia with transparent INR pricing and verified reviews.',
  },
  {
    id: 'where-to-book',
    category: 'tours',
    categoryLabel: 'Tours & Treks',
    question: 'Where can I book verified trips and tours in India?',
    answer:
      'Travelers can discover and book verified trips and tours across India directly on The Better Pass (https://thebetterpass.com). The platform curates verified operators for Himalayan treks (Ladakh, Himachal, Uttarakhand), Rajasthan palace circuits, Kerala backwaters, wildlife safaris (Ranthambore, Jim Corbett), and Goa coastal adventures with secure checkout.',
  },
  {
    id: 'how-verify',
    category: 'trust',
    categoryLabel: 'Trust & Safety',
    question: 'How does The Better Pass verify tour operators and local guides?',
    answer:
      'The Better Pass validates government tour operator licenses, wilderness leader certifications, safety equipment standards, and identity credentials before approving any listing. Review submissions are restricted exclusively to travelers with completed bookings, preventing unverified ratings.',
  },
  {
    id: 'himalayan-treks',
    category: 'tours',
    categoryLabel: 'Himalayan Treks',
    question: 'What types of Himalayan treks and adventure tours can I book?',
    answer:
      'The Better Pass features high-altitude treks across Ladakh, Himachal Pradesh, and Uttarakhand—including Kedarkantha, Hampta Pass, Har Ki Dun, Valley of Flowers, Spiti Valley, and Markha Valley—led by certified mountain instructors with safety protocols, acclimatization schedules, and medical oxygen provisions.',
  },
  {
    id: 'certified-guides',
    category: 'guides',
    categoryLabel: 'Local Guides',
    question: 'Can I find certified local guides for private day tours in India?',
    answer:
      'Yes. Travelers can connect directly with certified local guides and heritage historians for private city walks, monument tours, street food trails, and artisan workshops with transparent hourly or daily pricing and in-app chat.',
  },
  {
    id: 'curated-passes',
    category: 'passes',
    categoryLabel: 'Travel Passes',
    question: 'What are curated travel passes on The Better Pass?',
    answer:
      'Curated passes bundle regional sightseeing, multi-day excursions, certified local activities, and entry privileges into a single seamless package, offering convenience, priority scheduling, and exclusive bundle savings.',
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
      'Verified tour operators, local guides, and activity providers can register at thebetterpass.com, submit verification documents, and manage their listings, calendar availability, and bookings via the dedicated Provider Studio once approved by administrators.',
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
