import { type FC } from "react";
// import { initMercadoPago } from "@mercadopago/sdk-react";
import { Wallet } from "@mercadopago/sdk-react";

// initMercadoPago(import.meta.env.PUBLIC_MERCADOPAGO_PUBLIC_KEY);


export const BtnPago: FC = () => {
    return <div>
        <div id="wallet_container"></div>
        <Wallet initialization={{ preferenceId: 'a' }} />
    </div>
} 