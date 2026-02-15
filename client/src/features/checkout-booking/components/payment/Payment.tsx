import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, Wallet, Calendar, Lock, Check } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import "./Payment.scss";

export interface PaymentMethod {
  method: "card" | "paypal";
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolder: string;
  };
}

interface PaymentProps {
  onPaymentMethodChange: (payment: PaymentMethod) => void;
  amount: number;
  onPayPalApprove: (data: any, details: any) => void;
}

const paymentSchema = z.object({
  method: z.enum(["card", "paypal"]),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardHolder: z.string().optional(),
}).refine((data) => {
  if (data.method === "card") {
    const { cardNumber, expiryDate, cvv, cardHolder } = data;
    return !!cardNumber && !!expiryDate && !!cvv && !!cardHolder;
  }
  return true;
}, {
  message: "All card details are required",
  path: ["cardNumber"], // Focus error on card number for simplicity
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const Payment = ({ onPaymentMethodChange, amount, onPayPalApprove }: PaymentProps) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "card",
    },
  });

  const watchedValues = watch();
  const { method, cardNumber, expiryDate, cvv, cardHolder } = watchedValues;

  useEffect(() => {
    if (method === "card") {
      onPaymentMethodChange({
        method: "card",
        cardDetails: {
          cardNumber: cardNumber || "",
          expiryDate: expiryDate || "",
          cvv: cvv || "",
          cardHolder: cardHolder || "",
        },
      });
    } else {
      onPaymentMethodChange({ method: "paypal" });
    }
  }, [method, cardNumber, expiryDate, cvv, cardHolder, onPaymentMethodChange]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setValue("cardNumber", value);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    setValue("expiryDate", value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setValue("cvv", value);
  };

  return (
    <div className="payment">
      <div className="payment__header">
        <div className="payment__icon-container">
          <CreditCard className="payment__icon" />
        </div>
        <div className="payment__header-content">
          <h3 className="payment__title">Payment Method</h3>
          <span className="payment__subtitle">Secure and encrypted transaction</span>
        </div>
        <div className="payment__amount">
          ${amount.toFixed(2)}
        </div>
      </div>

      <div className="payment__methods">
        <label
          className={`payment__method ${method === "card" ? "payment__method--active" : ""
            }`}
        >
          <input
            type="radio"
            value="card"
            {...register("method")}
            className="payment__radio"
          />
          <CreditCard className="payment__method-icon" size={32} />
          <span className="payment__method-label">Credit Card</span>
          {method === "card" && (
            <div className="absolute top-2 right-2 text-primary-600">
              <Check size={16} />
            </div>
          )}
        </label>

        <label
          className={`payment__method ${method === "paypal" ? "payment__method--active" : ""
            }`}
        >
          <input
            type="radio"
            value="paypal"
            {...register("method")}
            className="payment__radio"
          />
          <div className="payment__paypal-icon" />
          <span className="payment__method-label">PayPal</span>
          {method === "paypal" && (
            <div className="absolute top-2 right-2 text-primary-600">
              <Check size={16} />
            </div>
          )}
        </label>
      </div>

      <div className="payment__content">
        {method === "card" ? (
          <div className="payment__card-form">
            <div className="payment__field">
              <label className="payment__label">Card Number</label>
              <div className="payment__input-wrapper">
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className={`payment__input ${errors.cardNumber ? "payment__input--error" : ""
                    }`}
                  value={cardNumber || ""}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
                <CreditCard className="payment__input-icon" size={20} />
              </div>
            </div>

            <div className="payment__row">
              <div className="payment__field">
                <label className="payment__label">Expiry Date</label>
                <div className="payment__input-wrapper">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className={`payment__input ${errors.expiryDate ? "payment__input--error" : ""
                      }`}
                    value={expiryDate || ""}
                    onChange={handleExpiryDateChange}
                    maxLength={5}
                  />
                  <Calendar className="payment__input-icon" size={20} />
                </div>
              </div>

              <div className="payment__field">
                <label className="payment__label">CVV</label>
                <div className="payment__input-wrapper">
                  <input
                    type="text"
                    placeholder="123"
                    className={`payment__input ${errors.cvv ? "payment__input--error" : ""
                      }`}
                    value={cvv || ""}
                    onChange={handleCvvChange}
                    maxLength={3}
                  />
                  <Lock className="payment__input-icon" size={20} />
                </div>
              </div>
            </div>

            <div className="payment__field">
              <label className="payment__label">Card Holder Name</label>
              <div className="payment__input-wrapper">
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`payment__input ${errors.cardHolder ? "payment__input--error" : ""
                    }`}
                  {...register("cardHolder")}
                />
                <Wallet className="payment__input-icon" size={20} />
              </div>
            </div>
          </div>
        ) : (
          <div className="payment__paypal-container">
            <p className="payment__paypal-text">
              You will be redirected to PayPal to complete your purchase securely.
            </p>
            <div className="payment__paypal-button-wrapper">
              <PayPalButtons
                style={{ layout: "horizontal", height: 48 }}
                forceReRender={[amount]}
                createOrder={(_data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "USD",
                          value: amount.toFixed(2),
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order!.capture().then((details) => {
                    onPayPalApprove(data, details);
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
