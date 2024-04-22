import { METADATA } from "@/lib/content/metadata";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/styles/chakra/theme";
import "@fontsource-variable/inter";
import "@/styles/tailwind/globals.css";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>
                    {METADATA.title} - {METADATA.description}
                </title>
            </Head>
            <ChakraProvider theme={theme}>
                <Component {...pageProps} />
            </ChakraProvider>
        </>
    );
}
