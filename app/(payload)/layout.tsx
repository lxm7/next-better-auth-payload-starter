/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import { importMap } from "./admin/importMap.js";

// Deviation from Payload's template: its empty `custom.scss` import is left
// out so the app doesn't take on `sass` for a stylesheet with no rules.

interface Args {
  children: ReactNode;
}

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
);

export default Layout;
