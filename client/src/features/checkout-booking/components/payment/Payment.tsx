import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./payment.scss";

import {
  paymentSchema,
  type PaymentFormData,
  type PaymentInfo,
} from "../../../../validation/payment";

interface PaymentProps {
  onPaymentChange: (payment: PaymentInfo) => void;
  amount: number;
  onPayPalApprove: (data: any, actions: any) => Promise<void>;
}

const Payment = ({
  onPaymentChange,
  amount,
  onPayPalApprove,
}: PaymentProps) => {
  // Fetch PayPal Client ID from env
  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "credit_card",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  const watchedValues = watch();

  const { paymentMethod, cardNumber, cardName, expiryDate, cvv } =
    watchedValues;

  useEffect(() => {
    onPaymentChange({
      paymentMethod,
      cardNumber,
      cardName,
      expiryDate,
      cvv,
    });
  }, [paymentMethod, cardNumber, cardName, expiryDate, cvv, onPaymentChange]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setValue("cardNumber", formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    value = value.substring(0, 5);
    setValue("expiryDate", value);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    setValue("cvv", value);
  };

  return (
    <div className="payment">
      <div className="payment__header">
        <svg
          className="payment__icon"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        <h3 className="payment__title">Payment Information</h3>
      </div>

      <div className="payment__methods">
        <label className="payment__method">
          <input
            {...register("paymentMethod")}
            type="radio"
            value="credit_card"
          />
          <span>Credit Card</span>
        </label>
        <label className="payment__method">
          <input
            {...register("paymentMethod")}
            type="radio"
            value="debit_card"
          />
          <span>Debit Card</span>
        </label>
        <label className="payment__method">
          <input {...register("paymentMethod")} type="radio" value="paypal" />
          <span>PayPal</span>
        </label>
      </div>

      {(watchedValues.paymentMethod === "credit_card" ||
        watchedValues.paymentMethod === "debit_card") && (
        <form className="payment__form">
          <div className="payment__field">
            <label htmlFor="cardNumber" className="payment__label">
              Card Number <span className="payment__required">*</span>
            </label>
            <input
              {...register("cardNumber")}
              type="text"
              id="cardNumber"
              className={`payment__input ${
                errors.cardNumber ? "payment__input--error" : ""
              } `}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
            />
            {errors.cardNumber && (
              <span className="payment__error">
                {errors.cardNumber.message}
              </span>
            )}
          </div>

          <div className="payment__field">
            <label htmlFor="cardName" className="payment__label">
              Cardholder Name <span className="payment__required">*</span>
            </label>
            <input
              {...register("cardName")}
              type="text"
              id="cardName"
              className={`payment__input ${
                errors.cardName ? "payment__input--error" : ""
              } `}
              placeholder="John Doe"
            />
            {errors.cardName && (
              <span className="payment__error">{errors.cardName.message}</span>
            )}
          </div>

          <div className="payment__row">
            <div className="payment__field">
              <label htmlFor="expiryDate" className="payment__label">
                Expiry Date <span className="payment__required">*</span>
              </label>
              <input
                {...register("expiryDate")}
                type="text"
                id="expiryDate"
                className={`payment__input ${
                  errors.expiryDate ? "payment__input--error" : ""
                } `}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
              />
              {errors.expiryDate && (
                <span className="payment__error">
                  {errors.expiryDate.message}
                </span>
              )}
            </div>

            <div className="payment__field">
              <label htmlFor="cvv" className="payment__label">
                CVV <span className="payment__required">*</span>
              </label>
              <input
                {...register("cvv")}
                type="text"
                id="cvv"
                className={`payment__input ${
                  errors.cvv ? "payment__input--error" : ""
                } `}
                onChange={handleCVVChange}
                placeholder="123"
              />
              {errors.cvv && (
                <span className="payment__error">{errors.cvv.message}</span>
              )}
            </div>
          </div>
        </form>
      )}

      {watchedValues.paymentMethod === "paypal" && (
        <div className="payment__paypal-info">
          <p className="payment__paypal-text">
            Complete your payment securely with PayPal.
          </p>
          <div className="payment__paypal-button">
            <PayPalScriptProvider options={initialOptions}>
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(_data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: "USD",
                          value: amount.toFixed(2),
                        },
                      },
                    ],
                    intent: "CAPTURE",
                  });
                }}
                onApprove={async (data, actions) => {
                  return actions.order!.capture().then(async (details) => {
                    await onPayPalApprove(data, details);
                  });
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
