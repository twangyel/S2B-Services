import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { mockFAQ } from '@/data';
import PageHeader from '@/components/common/PageHeader';
import { cn } from '@/lib/utils';

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const categories = [...new Set(mockFAQ.map((f) => f.category))];

  return (
    <div>
      <PageHeader title="FAQ" />
      <div className="px-4 py-4">
        <div className="mb-4 rounded-xl bg-primary-light p-4 text-center">
          <HelpCircle className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-2 text-base font-bold text-foreground">Frequently Asked Questions</h2>
          <p className="text-xs text-foreground-muted">Find answers to common questions</p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-4">
            <h3 className="mb-2 text-sm font-bold text-foreground">{category}</h3>
            <div className="space-y-2">
              {mockFAQ
                .filter((f) => f.category === category)
                .map((item) => (
                  <div key={item.id} className="rounded-xl bg-white shadow-card">
                    <button
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="pr-2 text-sm font-medium text-foreground">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 flex-shrink-0 text-foreground-muted transition-transform',
                          openId === item.id && 'rotate-180'
                        )}
                      />
                    </button>
                    {openId === item.id && (
                      <div className="border-t border-border px-4 pb-4 pt-2">
                        <p className="text-sm leading-relaxed text-foreground-muted">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
