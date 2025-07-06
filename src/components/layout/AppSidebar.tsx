import {
  Calendar,
  Users,
  User,
  FileText,
  UserCheck,
  Settings,
  Home,
  Phone,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Funcionários", url: "/funcionarios", icon: UserCheck },
]

const businessItems = [
  // { title: "Financeiro", url: "/financeiro", icon: BarChart3 },
  { title: "Whatsapp", url: "/whatsapp", icon: Phone },
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

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-white border-r border-gray-200/50">
        {/* Logo Section */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              AO
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-gray-900">Alpha Odonto</h2>
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
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? 'text-blue-600' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                      {!isCollapsed && (
                        <span
                          className={`font-semibold ${isActive(item.url) ? 'text-blue-700' : 'text-gray-500'
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
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                          {!isCollapsed && (
                            <span
                              className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-500'
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
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                          {!isCollapsed && (
                            <span
                              className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-500'
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