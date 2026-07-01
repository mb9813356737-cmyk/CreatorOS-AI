import * as React from "react";

export function RazorpayPaymentButton() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing children to prevent duplicate buttons during hot reloads
    containerRef.current.innerHTML = "";

    const form = document.createElement("form");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_T8JhtfA6dZD5hN");
    script.async = true;

    form.appendChild(script);
    containerRef.current.appendChild(form);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center py-2" />
  );
}
