import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type MetricType } from "web-vitals";

type PerformanceMetricPayload = {
  name: MetricType["name"];
  value: number;
  rating: MetricType["rating"];
  metricId: string;
  navigationType: MetricType["navigationType"];
  path: string;
  connection?: string;
};

function reportMetric(payload: PerformanceMetricPayload) {
  const beaconUrl = import.meta.env.VITE_PERFORMANCE_BEACON_URL;
  if (!beaconUrl) {
    if (import.meta.env.DEV) {
      console.info("[performance]", payload);
    }
    return;
  }

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon && navigator.sendBeacon(beaconUrl, body)) {
    return;
  }

  void fetch(beaconUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

export function PerformanceMonitoring() {
  useEffect(() => {
    const cloudflareToken = import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
    if (cloudflareToken && !document.querySelector("script[data-cf-beacon]")) {
      const script = document.createElement("script");
      script.defer = true;
      script.src = "https://static.cloudflareinsights.com/beacon.min.js";
      script.dataset.cfBeacon = JSON.stringify({ token: cloudflareToken });
      document.head.appendChild(script);
    }

    const connection = "connection" in navigator
      ? (navigator.connection as { effectiveType?: string }).effectiveType
      : undefined;

    const handleMetric = (metric: MetricType) => {
      reportMetric({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        metricId: metric.id,
        navigationType: metric.navigationType,
        path: location.pathname,
        connection,
      });
    };

    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  return null;
}
