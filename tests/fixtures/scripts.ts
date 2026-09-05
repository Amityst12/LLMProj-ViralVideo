/**
 * Golden Dataset for LLMProj-ViralVideo test suite.
 * Provides curated scripts for zero-token-cost, deterministic local verification.
 *
 * Success Criteria references:
 * - SC-1.1: Maximum length of 2,000 characters; rejection of empty/whitespace input.
 * - SC-1.2: Deterministic 150 WPM cadence baseline (2.5 words per second).
 * - SC-1.3: Partitioning into Swipe Zone (0-3s, ~7-8 words), Value Delivery (3-15s), Body (15s+).
 * - SC-3.3: High-friction openings (greetings, throat-clearing) yield early swipe drop-off.
 */

/**
 * viralScript: A tight, high-velocity script with a concise hook under 8 words in 0-3s.
 * Contains zero filler words, immediate visceral pattern interrupt, and high stakes.
 *
 * Swipe Zone (0-3s, 7 words): "Stop drinking coffee immediately after waking up."
 * Value Delivery (3-15s, ~28 words): Cortisol explanation and biological impact.
 * Body (15s+, ~41 words): Protocol payoff and sustained energy benefit.
 */
export const viralScript =
  'Stop drinking coffee immediately after waking up. When you wake up, your cortisol levels are already peaking naturally. Introducing caffeine immediately spikes your heart rate and causes a severe energy crash by early afternoon. Instead, drink sixteen ounces of mineral water with Celtic sea salt. Wait ninety minutes before your first brew so your adenosine receptors clear. This simple reset stabilizes your focus, eliminates afternoon brain fog, and keeps your mental clarity sharp all day long.';

/**
 * mediocreScript: A low-velocity script characterized by slow preamble, greetings, and throat-clearing.
 * Fails the 3-second threshold due to preamble fatigue ("היי חברים...").
 *
 * Swipe Zone (0-3s, 8 words): "היי חברים, מה קורה? ברוכים הבאים לעוד סרטון"
 * Value Delivery (3-15s): Logistics, throat clearing, begging for subscriptions.
 * Body (15s+): Delayed thesis payoff.
 */
export const mediocreScript =
  'היי חברים, מה קורה? ברוכים הבאים לעוד סרטון בערוץ שלי! היום אני רוצה לדבר איתכם על איך לנהל את הזמן שלכם יותר טוב, כי שמתי לב שהמון אנשים מסתבכים עם זה ביומיום. אבל רגע לפני שנתחיל, אם אתם חדשים פה, אל תשכחו ללחוץ על כפתור הסאבסקרייב ולהפעיל את הפעמון כדי לא לפספס אף עדכון. אז ככה, ניהול זמן זה אחד הדברים הכי חשובים לכל עצמאי או סטודנט שרוצה להצליח בחיים, ואני הולך לתת לכם כמה טיפים שיעזרו לכם.';

/**
 * oversizedScript: A script exceeding the strict 2,000 character limit defined in SC-1.1.
 * Must trigger an explicit ValidationError upon ingestion.
 */
const oversizedBaseText =
  'The comprehensive analysis of algorithmic short-form video retention requires an exhaustive examination of cognitive mechanics, neural dopamine loops, and temporal attention decay. When a viewer scrolls through vertical video feeds such as TikTok, Instagram Reels, or YouTube Shorts, their brain operates in an ultra-fast pattern recognition mode. Within the initial sub-second window, visual stimulation, auditory cadence, and syntactic clarity collide to produce an instant micro-decision: swipe or stay. ';

export const oversizedScript = oversizedBaseText.repeat(6);

/**
 * Additional edge-case fixtures to support comprehensive boundary testing.
 */
export const emptyScript = '';
export const whitespaceScript = '   \n\t  \r\n   ';
export const exact2000Script = 'A'.repeat(2000);
export const exact2001Script = 'A'.repeat(2001);
