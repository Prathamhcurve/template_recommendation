import "@/index.css";
import "@/App.scss";
import Providers from "./Providers";
import MainLayout from "./MainLayout";

export const metadata = {
  title: "Templates",
  description: "Web site created using create-react-app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  );
}
