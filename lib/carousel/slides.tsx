import { BRAND, SLIDE_WIDTH, SLIDE_HEIGHT, FOOTER_HEIGHT } from "./brand";
import type { Card } from "./types";

// ── Shared layout components ──────────────────────────────────────────

function SlideContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        backgroundColor: BRAND.CREAM,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

/** Dark footer bar with logo left + navigation right */
function FooterBar({
  logoBase64,
  navLabel,
}: {
  logoBase64: string;
  navLabel?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: FOOTER_HEIGHT,
        backgroundColor: BRAND.BLACK,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 60,
        paddingRight: 60,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logoBase64} height={24} />
      </div>
      {navLabel ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 22,
            fontWeight: 700,
            color: BRAND.WHITE,
          }}
        >
          {navLabel}
          <span style={{ marginLeft: 12, fontSize: 24 }}>{"→"}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Section label at top-left (e.g., "STEP 1", "INSIGHT 2") */
function SectionLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: BRAND.FONT_HEADLINE,
        fontSize: 20,
        fontWeight: 700,
        color: BRAND.GRAY_600,
        textTransform: "uppercase",
        letterSpacing: 3,
      }}
    >
      {text}
    </div>
  );
}

/** Decorative purple circle - positioned absolutely */
function DecoCircle({
  size,
  top,
  left,
  right,
  bottom,
  opacity,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}) {
  const posStyle: Record<string, number> = {};
  if (top !== undefined) posStyle.top = top;
  if (left !== undefined) posStyle.left = left;
  if (right !== undefined) posStyle.right = right;
  if (bottom !== undefined) posStyle.bottom = bottom;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: BRAND.PURPLE,
        opacity: opacity ?? 0.08,
        ...posStyle,
      }}
    />
  );
}

/** Pill-shaped button */
function PillButton({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BRAND.BLACK,
        color: BRAND.WHITE,
        fontFamily: BRAND.FONT_HEADLINE,
        fontSize: 24,
        fontWeight: 700,
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 18,
        paddingBottom: 18,
        borderRadius: 50,
      }}
    >
      {text}
      <span style={{ marginLeft: 14, fontSize: 26 }}>{"→"}</span>
    </div>
  );
}

// ── Slide types ───────────────────────────────────────────────────────

export function TitleSlide({
  title,
  subtitle,
  logoBase64,
}: {
  title: string;
  subtitle?: string;
  logoBase64: string;
}) {
  return (
    <SlideContainer>
      <DecoCircle size={300} top={-80} right={-80} opacity={0.06} />
      <DecoCircle size={180} bottom={140} left={-60} opacity={0.05} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 50,
          paddingRight: 60,
          paddingBottom: 0,
          paddingLeft: 60,
        }}
      >
        <img src={logoBase64} height={36} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 80,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 18,
            fontWeight: 700,
            color: BRAND.PURPLE,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {"GUIDE"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          paddingLeft: 70,
          paddingRight: 70,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 64,
            fontWeight: 700,
            color: BRAND.BLACK,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontFamily: BRAND.FONT_BODY,
              fontSize: 28,
              color: BRAND.GRAY_600,
              marginTop: 20,
              textAlign: "center",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingBottom: 70,
        }}
      >
        <PillButton text="Learn how" />
      </div>
    </SlideContainer>
  );
}

export function StatSlide({
  value,
  label,
  logoBase64,
  navLabel,
}: {
  value: string;
  label: string;
  logoBase64: string;
  navLabel?: string;
}) {
  return (
    <SlideContainer>
      <DecoCircle size={400} top={-150} right={-150} opacity={0.06} />
      <DecoCircle size={120} bottom={140} left={60} opacity={0.04} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          paddingBottom: FOOTER_HEIGHT,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 120,
            fontWeight: 700,
            color: BRAND.PURPLE,
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: BRAND.FONT_BODY,
            fontSize: 28,
            color: BRAND.GRAY_600,
            marginTop: 20,
            textTransform: "uppercase",
            letterSpacing: 3,
            textAlign: "center",
            paddingLeft: 80,
            paddingRight: 80,
          }}
        >
          {label}
        </div>
      </div>

      <FooterBar logoBase64={logoBase64} navLabel={navLabel} />
    </SlideContainer>
  );
}

export function InsightSlide({
  headline,
  body,
  logoBase64,
  sectionLabel,
  navLabel,
}: {
  headline: string;
  body: string;
  logoBase64: string;
  sectionLabel?: string;
  navLabel?: string;
}) {
  return (
    <SlideContainer>
      <DecoCircle size={240} top={-60} right={-60} opacity={0.05} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          flex: 1,
          paddingTop: 60,
          paddingLeft: 70,
          paddingRight: 70,
          paddingBottom: FOOTER_HEIGHT + 30,
        }}
      >
        {sectionLabel ? <SectionLabel text={sectionLabel} /> : null}

        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 48,
            fontWeight: 700,
            color: BRAND.BLACK,
            lineHeight: 1.15,
            marginTop: sectionLabel ? 16 : 0,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            width: 60,
            height: 5,
            backgroundColor: BRAND.PURPLE,
            borderRadius: 3,
            marginTop: 30,
            marginBottom: 30,
          }}
        />

        <div
          style={{
            fontFamily: BRAND.FONT_BODY,
            fontSize: 26,
            color: BRAND.GRAY_600,
            lineHeight: 1.6,
          }}
        >
          {body}
        </div>
      </div>

      <FooterBar logoBase64={logoBase64} navLabel={navLabel} />
    </SlideContainer>
  );
}

export function StepSlide({
  number,
  title,
  description,
  logoBase64,
  navLabel,
}: {
  number: number;
  title: string;
  description: string;
  logoBase64: string;
  navLabel?: string;
}) {
  return (
    <SlideContainer>
      <DecoCircle size={200} bottom={FOOTER_HEIGHT + 40} right={-60} opacity={0.05} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          flex: 1,
          paddingTop: 60,
          paddingLeft: 70,
          paddingRight: 70,
          paddingBottom: FOOTER_HEIGHT + 30,
        }}
      >
        <SectionLabel text={`Step ${number}`} />

        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 48,
            fontWeight: 700,
            color: BRAND.BLACK,
            lineHeight: 1.15,
            marginTop: 16,
          }}
        >
          {title}
        </div>

        <div
          style={{
            width: 60,
            height: 5,
            backgroundColor: BRAND.PURPLE,
            borderRadius: 3,
            marginTop: 30,
            marginBottom: 30,
          }}
        />

        <div
          style={{
            fontFamily: BRAND.FONT_BODY,
            fontSize: 26,
            color: BRAND.GRAY_600,
            lineHeight: 1.6,
          }}
        >
          {description}
        </div>
      </div>

      <FooterBar logoBase64={logoBase64} navLabel={navLabel} />
    </SlideContainer>
  );
}

export function TakeawaySlide({
  text,
  logoBase64,
  navLabel,
}: {
  text: string;
  logoBase64: string;
  navLabel?: string;
}) {
  return (
    <SlideContainer>
      <DecoCircle size={350} top={-120} left={-120} opacity={0.06} />
      <DecoCircle size={180} bottom={FOOTER_HEIGHT + 60} right={-40} opacity={0.04} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          flex: 1,
          paddingTop: 60,
          paddingLeft: 70,
          paddingRight: 70,
          paddingBottom: FOOTER_HEIGHT + 30,
        }}
      >
        <SectionLabel text="Key takeaway" />

        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 80,
            fontWeight: 700,
            color: BRAND.PURPLE,
            lineHeight: 0.8,
            marginTop: 20,
            marginBottom: 10,
          }}
        >
{"\u201C"}
        </div>

        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 44,
            fontWeight: 700,
            color: BRAND.BLACK,
            lineHeight: 1.25,
          }}
        >
          {text}
        </div>
      </div>

      <FooterBar logoBase64={logoBase64} navLabel={navLabel} />
    </SlideContainer>
  );
}

export function CTASlide({
  logoBase64,
}: {
  logoBase64: string;
}) {
  return (
    <SlideContainer>
      <DecoCircle size={300} top={-100} left={-100} opacity={0.06} />
      <DecoCircle size={200} bottom={-60} right={-60} opacity={0.05} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingTop: 50,
          paddingRight: 60,
          paddingBottom: 0,
          paddingLeft: 60,
        }}
      >
        <img src={logoBase64} height={36} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          paddingLeft: 70,
          paddingRight: 70,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 18,
            fontWeight: 700,
            color: BRAND.PURPLE,
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 30,
          }}
        >
          {"Want to build a system?"}
        </div>

        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 56,
            fontWeight: 700,
            color: BRAND.BLACK,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {"Let's make your pipeline predictable"}
        </div>

        <div
          style={{
            width: 60,
            height: 5,
            backgroundColor: BRAND.PURPLE,
            borderRadius: 3,
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        <PillButton text="driveroi.ai" />
      </div>
    </SlideContainer>
  );
}

// ── Card navigation helpers ───────────────────────────────────────────

function getNavLabel(cards: Card[], index: number): string | undefined {
  if (index >= cards.length - 1) return undefined; // last card, no nav
  const next = cards[index + 1];
  switch (next.type) {
    case "stat": return "Next";
    case "insight": return "Next";
    case "step": return "Next step";
    case "takeaway": return "Takeaway";
  }
}

function getSectionLabel(card: Card, index: number): string | undefined {
  switch (card.type) {
    case "insight": return `Insight ${index + 1}`;
    case "step": return undefined; // StepSlide handles its own label
    case "stat": return undefined;
    case "takeaway": return undefined; // TakeawaySlide handles its own label
  }
}

/**
 * Renders a card to its corresponding satori JSX element.
 */
export function renderCard(
  card: Card,
  logoBase64: string,
  cards: Card[],
  cardIndex: number,
) {
  const navLabel = getNavLabel(cards, cardIndex);

  switch (card.type) {
    case "stat":
      return (
        <StatSlide
          value={card.value}
          label={card.label}
          logoBase64={logoBase64}
          navLabel={navLabel}
        />
      );
    case "insight":
      return (
        <InsightSlide
          headline={card.headline}
          body={card.body}
          logoBase64={logoBase64}
          sectionLabel={getSectionLabel(card, cardIndex)}
          navLabel={navLabel}
        />
      );
    case "step":
      return (
        <StepSlide
          number={card.number}
          title={card.title}
          description={card.description}
          logoBase64={logoBase64}
          navLabel={navLabel}
        />
      );
    case "takeaway":
      return (
        <TakeawaySlide
          text={card.text}
          logoBase64={logoBase64}
          navLabel={navLabel}
        />
      );
  }
}
