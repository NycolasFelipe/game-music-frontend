import { Box } from "@mantine/core";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { AppRoutes } from "@/routes/AppRoutes";

/** Application shell: a global theme toggle plus the routed pages. */
export function App() {
  return (
    <>
      <Box style={{ position: "fixed", top: 12, right: 12, zIndex: 200 }}>
        <ColorSchemeToggle />
      </Box>
      <AppRoutes />
    </>
  );
}
