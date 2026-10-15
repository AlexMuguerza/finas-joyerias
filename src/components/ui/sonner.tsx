"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

/**
 * Sin `useTheme()` a propósito. Este sitio es de tema claro por diseño (paleta
 * crema/oro, sin variantes `dark:` en el sistema) y nunca se montó un
 * `ThemeProvider`, así que la llamada devolvía siempre el valor por defecto.
 * Además `providers.tsx` pasa `theme="light"` y `{...props}` se expande al
 * final, con lo que ganaba sobre cualquier valor interno.
 *
 * Para activar modo oscuro habría que montar `ThemeProvider` en el layout
 * raíz y redefinir la paleta completa, no solo este componente.
 */
const Toaster = ({ theme = "light", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
