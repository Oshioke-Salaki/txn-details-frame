/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { neynar } from "frog/hubs";
import { handle } from "frog/next";
import { pinata } from "frog/hubs";
import { CovalentClient } from "@covalenthq/client-sdk";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";

type State = {
  txn: any;
  error: string;
};

const app = new Frog<{ State: State }>({
  // assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: "NEYNAR_FROG_FM" }),
  hub: pinata(),
  initialState: {
    txn: undefined,
    error: "",
  },
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/", async (c) => {
  console.log(c);
  const { buttonValue, inputText, status, deriveState, verified } = c;

  const state = await deriveState(async (previousState) => {
    console.log(inputText);

    try {
      previousState.error = "";
      if (!inputText || buttonValue !== "fetch") {
        previousState.error = "❌ Type in a txn hash to fetch data.";
        return;
      }
      console.log(inputText);
      const client = new CovalentClient("cqt_rQfxVDdbwYqrjyQgRRjjp6dkCcr9");
      const resp = await client.TransactionService.getTransaction(
        "eth-mainnet",
        inputText
      );
      const {
        tx_hash,
        successful,
        block_signed_at,
        from_address,
        to_address,
        value,
        gas_spent,
        pretty_value_quote,
      } = resp.data.items[0];
      console.log(resp.data);
      previousState.txn = {
        ...previousState.txn,
        tx_hash,
        successful,
        block_signed_at,
        from_address,
        to_address,
        value: value?.toString(16),
        gas_spent,
        pretty_value_quote,
      };
    } catch (err: any) {
      console.log(err);
      previousState.error = err.message;
    }
  });
  // if (verified) {
  return c.res({
    image: (
      <div
        style={{
          color: "white",
          fontSize: 24,
          background: status === "response" ? "#011222" : "#011222",
          backgroundSize: "100% 100%",
          display: "flex",
          height: "100%",
          // textAlign: "center",
          width: "100%",
          padding: "40px 28px",
          // height: '1200px'
        }}
      >
        {state?.txn?.tx_hash ? (
          <div
            style={{
              display: "flex",
              // gridTemplateColumns: "1fr_1fr",
              flexWrap: "wrap",
              gap: "24",
            }}
          >
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                // marginTop: 30,
                // padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                // height: "1200px",
              }}
            >
              <h3>Transaction Hash #️⃣</h3>
              {state?.txn?.tx_hash}
            </div>
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                // marginTop: 30,
                // padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                // height: "1200px",
              }}
            >
              <h3>Status 🚀</h3>
              {state?.txn?.successful ? "Successful" : "Failed"}
            </div>
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
              }}
            >
              <h3>Transaction Time 🕣</h3>
              {state?.txn?.block_signed_at}
            </div>
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                // marginTop: 30,
                // padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                // height: "1200px",
              }}
            >
              <h3>Transaction From 👨🏽</h3>
              {state?.txn?.from_address}
            </div>
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                // marginTop: 30,
                // padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                // height: "1200px",
              }}
            >
              <h3>Transaction To 👨🏽</h3>
              {state?.txn?.to_address}
            </div>
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                // marginTop: 30,
                // padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                // height: "1200px",
              }}
            >
              <h3>Value 💰</h3>
              {state?.txn?.value}
            </div>
            <div
              style={{
                fontStyle: "normal",
                letterSpacing: "-0.025em",
                lineHeight: 1.4,
                // marginTop: 30,
                // padding: "0 120px",
                whiteSpace: "pre-wrap",
                display: "flex",
                flexGrow: 1,
                flexDirection: "column",
                // height: "1200px",
              }}
            >
              <h3>Gas Spent ⛽️</h3>
              {state?.txn?.gas_spent}
            </div>
          </div>
        ) : (
          <p
            style={{
              textAlign: "center",
              width: "100%",
              fontSize: 40,
              padding: "80px 0",
            }}
          >
            {state.error
              ? state.error
              : "Hey there 👋🏾, Input a Transcation ID on ethereum mainnet to continue😉🧑🏾‍💻"}
          </p>
        )}
      </div>
    ),
    intents: [
      status !== "response" && (
        <TextInput placeholder="Enter transaction hash..." />
      ),
      status !== "response" && <Button value="fetch">Fetch Txn Info 💰</Button>,
      status === "response" && <Button.Reset>Reset ❌</Button.Reset>,
    ],
  });
  // }
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
