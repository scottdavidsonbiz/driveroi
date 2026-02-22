import { BRAND, SLIDE_WIDTH, SLIDE_HEIGHT } from "./brand";
import type { Card } from "./types";

// Base container shared by all slides
function SlideContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
        backgroundColor: BRAND.BLACK,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}

// Logo footer shared by content slides
function LogoFooter({ logoBase64 }: { logoBase64: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        display: "flex",
        alignItems: "center",
        paddingLeft: 80,
      }}
    >
      <img src={logoBase64} height={20} />
    </div>
  );
}

// Purple accent bar (top or bottom)
function AccentBar({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      style={{
        position: "absolute",
        [position]: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: BRAND.PURPLE,
      }}
    />
  );
}

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
      <AccentBar position="top" />
      {/* Logo top-left */}
      <img
        src={logoBase64}
        style={{ position: "absolute", top: 40, left: 80, height: 48 }}
      />
      {/* Content centered */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: 80,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 56,
            fontWeight: 700,
            color: BRAND.WHITE,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: BRAND.FONT_BODY,
              fontSize: 32,
              color: BRAND.GRAY_400,
              marginTop: 24,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <AccentBar position="bottom" />
    </SlideContainer>
  );
}

export function StatSlide({
  value,
  label,
  logoBase64,
}: {
  value: string;
  label: string;
  logoBase64: string;
}) {
  return (
    <SlideContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: BRAND.FONT_HEADLINE,
            fontSize: 96,
            fontWeight: 700,
            color: BRAND.PURPLE,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontFamily: BRAND.FONT_BODY,
            fontSize: 28,
            color: BRAND.GRAY_400,
            marginTop: 16,
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          {label}
        </div>
      </div>
      <LogoFooter logoBase64={logoBase64} />
    </SlideContainer>
  );
}

export function InsightSlide({
  headline,
  body,
  logoBase64,
}: {
  headline: string;
  body: string;
  logoBase64: string;
}) {
  return (
    <SlideContainer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            width: 860,
          }}
        >
          {/* Purple accent bar */}
          <div
            style={{
              width: 6,
              backgroundColor: BRAND.PURPLE,
              borderRadius: 3,
              marginRight: 40,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: BRAND.FONT_HEADLINE,
                fontSize: 40,
                fontWeight: 700,
                color: BRAND.WHITE,
                lineHeight: 1.2,
                marginBottom: body ? 20 : 0,
              }}
            >
              {headline}
            </div>
            {body && (
              <div
                style={{
                  fontFamily: BRAND.FONT_BODY,
                  fontSize: 28,
                  color: BRAND.GRAY_400,
                  lineHeight: 1.5,
                }}
              >
                {body}
              </div>
            )}
          </div>
        </div>
      </div>
      <LogoFooter logoBase64={logoBase64} />
    </SlideContainer>
  );
}

export function StepSlide({
  number,
  title,
  description,
  logoBase64,
}: {
  number: number;
  title: string;
  description: string;
  logoBase64: string;
}) {
  return (
    <SlideContainer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", width: 860 }}>
          {/* Numbered circle */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: BRAND.PURPLE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginRight: 36,
            }}
          >
            <span
              style={{
                fontFamily: BRAND.FONT_HEADLINE,
                fontSize: 32,
                fontWeight: 700,
                color: BRAND.WHITE,
              }}
            >
              {String(number).padStart(2, "0")}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: BRAND.FONT_HEADLINE,
                fontSize: 38,
                fontWeight: 700,
                color: BRAND.WHITE,
                lineHeight: 1.2,
                marginBottom: 14,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: BRAND.FONT_BODY,
                fontSize: 26,
                color: BRAND.GRAY_400,
                lineHeight: 1.5,
              }}
            >
              {description}
            </div>
          </div>
        </div>
      </div>
      <LogoFooter logoBase64={logoBase64} />
    </SlideContainer>
  );
}

export function TakeawaySlide({
  text,
  logoBase64,
}: {
  text: string;
  logoBase64: string;
}) {
  return (
    <SlideContainer>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            width: 860,
          }}
        >
          <div
            style={{
              width: 6,
              backgroundColor: BRAND.PURPLE,
              borderRadius: 3,
              marginRight: 40,
              flexShrink: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: BRAND.FONT_HEADLINE,
                fontSize: 40,
                fontWeight: 700,
                color: BRAND.WHITE,
                lineHeight: 1.2,
              }}
            >
              {text}
            </div>
          </div>
        </div>
      </div>
      <LogoFooter logoBase64={logoBase64} />
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
      <AccentBar position="top" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <img src={logoBase64} style={{ height: 72, marginBottom: 32 }} />
        {/* Divider */}
        <div
          style={{
            width: 60,
            height: 4,
            backgroundColor: BRAND.PURPLE,
            borderRadius: 2,
            marginBottom: 32,
          }}
        />
        <div
          style={{
            fontFamily: BRAND.FONT_BODY,
            fontSize: 28,
            color: BRAND.GRAY_400,
          }}
        >
          driveroi.ai
        </div>
      </div>
      <AccentBar position="bottom" />
    </SlideContainer>
  );
}

/**
 * Renders a card to its corresponding satori JSX element.
 */
export function renderCard(card: Card, logoBase64: string) {
  switch (card.type) {
    case "stat":
      return (
        <StatSlide
          value={card.value}
          label={card.label}
          logoBase64={logoBase64}
        />
      );
    case "insight":
      return (
        <InsightSlide
          headline={card.headline}
          body={card.body}
          logoBase64={logoBase64}
        />
      );
    case "step":
      return (
        <StepSlide
          number={card.number}
          title={card.title}
          description={card.description}
          logoBase64={logoBase64}
        />
      );
    case "takeaway":
      return (
        <TakeawaySlide text={card.text} logoBase64={logoBase64} />
      );
  }
}
