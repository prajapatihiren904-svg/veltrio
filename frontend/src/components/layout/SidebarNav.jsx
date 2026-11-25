import { NavLink } from 'react-router-dom';
import Badge from '@/components/common/Badge';
import { cn } from '@/utils/cn';

const itemBase =
  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300';

export default function SidebarNav({ sections, onNavigate }) {
  return (
    <nav aria-label="Main navigation" className="space-y-6">

      {sections.map((section) => (
        <div key={section.label}>

          {/* SECTION TITLE */}
          <p className="
            mb-2 px-3
            text-[11px] font-semibold
            uppercase tracking-[0.13em]
            text-content-subtle
          ">
            {section.label}
          </p>

          <ul className="space-y-1">

            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label}>

                  {item.available ? (

                    <NavLink
                      to={item.to}
                      end
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          itemBase,
                          isActive
                            ? 'bg-emerald-500/[0.12] text-emerald-400'
                            : 'text-content-muted hover:bg-white/[0.035] hover:text-white'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>

                          {/* ACTIVE INDICATOR */}
                          {isActive && (
                            <span className="
                              absolute left-0 top-1/2
                              h-5 w-[3px]
                              -translate-y-1/2
                              rounded-r-full
                              bg-emerald-400
                              shadow-[0_0_10px_rgba(52,211,153,0.5)]
                            " />
                          )}

                          {/* ICON */}
                          <Icon
                            className={cn(
                              'h-[18px] w-[18px] shrink-0 transition-all duration-300',
                              isActive
                                ? 'text-emerald-400'
                                : 'text-content-muted group-hover:text-emerald-400'
                            )}
                            aria-hidden="true"
                          />

                          {/* LABEL */}
                          <span className="flex-1">
                            {item.label}
                          </span>

                          {isActive && (
                            <span className="
                              h-1.5 w-1.5 rounded-full
                              bg-emerald-400
                              shadow-[0_0_8px_rgba(52,211,153,0.6)]
                            " />
                          )}

                        </>
                      )}
                    </NavLink>

                  ) : (

                    <span
                      aria-disabled="true"
                      className={cn(
                        itemBase,
                        'cursor-not-allowed text-content-subtle'
                      )}
                      title="Coming in a later phase"
                    >
                      <Icon
                        className="h-[18px] w-[18px] shrink-0"
                        aria-hidden="true"
                      />

                      <span className="flex-1">
                        {item.label}
                      </span>

                      <Badge>Soon</Badge>
                    </span>

                  )}

                </li>
              );
            })}

          </ul>
        </div>
      ))}

    </nav>
  );
}