import {
  Calendar,
  FileText,
  Home,
  Phone,
  Settings,
  UserCheck,
  Users
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { useClinic } from "@/context/ClinicContext"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Funcionários", url: "/funcionarios", icon: UserCheck },
]

const businessItems = [
  // { title: "Financeiro", url: "/financeiro", icon: BarChart3 },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
]

const systemItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings },
  // { title: "Área do Paciente", url: "/area-paciente", icon: User },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const { clinicName } = useClinic()

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-white border-r border-gray-200/50">
        {/* Logo Section */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="favicon.svg" alt="Software Logo" className="w-10 h-10" />
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-gray-900">{clinicName}</h2>
                <p className="text-xs text-gray-500">Sistema de IA Integrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) => `
                        flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-[#dbeafe] text-[#2563eb] font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-[#2563eb]' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                      {!isCollapsed && (
                        <span
                          className={`font-semibold ${isActive(item.url) ? 'text-[#2563eb]' : 'text-gray-500'
                            }`}
                        >
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => `
                        flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-[#dbeafe] text-[#2563eb] font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-[#2563eb]' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                          {!isCollapsed && (
                            <span
                              className={`font-semibold ${isActive ? 'text-[#2563eb]' : 'text-gray-500'
                                }`}
                            >
                              {item.title}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => `
                        flex items-center w-full px-3 py-2 rounded-lg transition-all duration-200
                        ${isActive
                          ? 'bg-[#dbeafe] text-[#2563eb] font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-[#2563eb]' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                          {!isCollapsed && (
                            <span
                              className={`font-semibold ${isActive ? 'text-[#2563eb]' : 'text-gray-500'
                                }`}
                            >
                              {item.title}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {/* TODO: */}
        {/* Collapse trigger */}
        {/* <div className="mt-auto p-2">
          <SidebarTrigger className="w-full h-10 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors" />
        </div> */}
      </SidebarContent>
    </Sidebar>
  )
}