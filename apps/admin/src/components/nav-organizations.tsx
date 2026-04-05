import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { 
  Building2, 
  FolderKanban, 
  FileText,
  MoreHorizontal,
  Plus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Form {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  forms: Form[]
}

interface Organization {
  id: string
  name: string
  projects: Project[]
}

const MOCK_ORGS: Organization[] = [
  {
    id: "1",
    name: "Acme Corp",
    projects: [
      {
        id: "p1",
        name: "Website Redesign",
        forms: [
          { id: "f1", name: "Contact Form" },
          { id: "f2", name: "Feedback Survey" }
        ]
      },
      {
        id: "p2",
        name: "Marketing Campaign",
        forms: [
          { id: "f3", name: "Lead Gen" }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Global Tech",
    projects: [
      {
        id: "p3",
        name: "Mobile App",
        forms: [
          { id: "f4", name: "Beta Signup" }
        ]
      }
    ]
  }
]

export function NavOrganizations() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organizations</SidebarGroupLabel>
      <SidebarMenu>
        {MOCK_ORGS.map((org) => (
          <Collapsible key={org.id} asChild className="group/org">
            <SidebarMenuItem className="relative">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={org.name} className="hover:bg-indigo-500/10 group-data-[state=open]/org:text-white transition-all">
                  <Building2 className="h-4 w-4 text-indigo-400/80" />
                  <span className="font-semibold text-[14px]">{org.name}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              
              <div className="flex items-center">
                <SidebarMenuAction 
                  showOnHover 
                  className="right-8 top-0.5 h-7 w-7 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); console.log("Add project to", org.name); }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only">Add Project</span>
                </SidebarMenuAction>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover className="right-1 top-0.5 h-7 w-7">
                      <MoreHorizontal />
                      <span className="sr-only">Settings</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem>Add Project</DropdownMenuItem>
                  <DropdownMenuItem>Rename Organization</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent className="relative ml-0 overflow-hidden transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                {/* Vertical guide line for projects - shifted left */}
                <div className="absolute left-7.75 top-0 bottom-6 w-px bg-linear-to-b from-zinc-800 to-transparent opacity-60" />
                
                <SidebarMenuSub className="ml-0 mr-0 border-none px-0">
                  {org.projects.map((project) => (
                    <Collapsible key={project.id} asChild className="group/project">
                      <SidebarMenuSubItem className="pl-8 pr-0">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuSubButton className="hover:bg-indigo-500/5 group-data-[state=open]/project:text-indigo-400 pr-10">
                            <FolderKanban className="h-3.5 w-3.5 opacity-70" />
                            <span className="text-[13px] font-medium">{project.name}</span>
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>

                        <div className="flex items-center">
                          <SidebarMenuAction 
                            showOnHover 
                            className="right-8 top-0.5 h-7 w-7 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); console.log("Add form to", project.name); }}
                          >
                            <Plus className="h-3 w-3" />
                          </SidebarMenuAction>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction showOnHover className="right-1 top-0.5 h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" className="bg-zinc-950 border-zinc-800">
                            <DropdownMenuItem>Add Form</DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <CollapsibleContent className="relative ml-0">
                          {/* Vertical guide line for forms - shifted left */}
                          <div className="absolute left-3.75 top-0 bottom-4 w-px bg-linear-to-b from-zinc-800 to-transparent opacity-40" />
                          
                          <SidebarMenuSub className="ml-0 mr-0 border-none px-0">
                            {project.forms.map((form) => (
                              <SidebarMenuSubItem key={form.id} className="pl-4 pr-0">
                                <div className="group/form relative flex items-center">
                                  <SidebarMenuSubButton className="flex-1 hover:bg-zinc-900/50 pr-8">
                                    <FileText className="h-3 w-3 opacity-50" />
                                    <span className="text-[12px] text-zinc-400 group-hover/form:text-zinc-200">{form.name}</span>
                                  </SidebarMenuSubButton>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <SidebarMenuAction showOnHover className="right-1 top-0.5 h-6 w-6">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="bg-zinc-950 border-zinc-800 text-[12px]">
                                      <DropdownMenuItem>View Entries</DropdownMenuItem>
                                      <DropdownMenuItem>Edit Form</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuSubItem>
                    </Collapsible>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
        
        {/* Add Organization Button */}
        <SidebarMenuItem>
          <SidebarMenuButton 
            className="mt-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all border border-dashed border-zinc-800/50 hover:border-indigo-500/30 mx-1 w-[calc(100%-8px)]"
            onClick={() => console.log("Create new organization")}
          >
            <Plus className="h-4 w-4" />
            <span className="font-medium">Add Organization</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
