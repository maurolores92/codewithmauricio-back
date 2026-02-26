import { Permission } from "../permission.model";


export const permissionsSeed = [
  // Páginas principales
  { name: 'Ver Dashboard', slug: 'view-dashboard', type: 'page', resource: '/dashboards', description: 'Acceso a la página de dashboard' },
  { name: 'Ver Post Generator', slug: 'view-post-generator', type: 'page', resource: '/post-generator', description: 'Acceso al generador de posts' },
  { name: 'Ver CV Analyzer', slug: 'view-cv-analyzer', type: 'page', resource: '/cv-analyzer', description: 'Acceso al analizador de CVs' },
  { name: 'Ver PDF Summarizer', slug: 'view-pdf-summarizer', type: 'page', resource: '/pdf-summarizer', description: 'Acceso al resumen de PDFs' },
  
  // Configuración
  { name: 'Ver Configuración', slug: 'view-settings', type: 'page', resource: '/settings', description: 'Acceso al menú de configuración' },
  { name: 'Ver Roles', slug: 'view-roles', type: 'page', resource: '/settings/roles', description: 'Acceso a la gestión de roles' },
  { name: 'Ver Usuarios', slug: 'view-users', type: 'page', resource: '/settings/users', description: 'Acceso a la gestión de usuarios' },
  { name: 'Ver Permisos', slug: 'view-permissions', type: 'page', resource: '/settings/permissions', description: 'Acceso a la gestión de permisos' },

  // Kanban - Boards
  { name: 'Ver Tableros', slug: 'view-boards', type: 'action', resource: 'boards', description: 'Ver tableros' },
  { name: 'Crear Tableros', slug: 'create-boards', type: 'action', resource: 'boards', description: 'Crear tableros' },
  { name: 'Editar Tableros', slug: 'edit-boards', type: 'action', resource: 'boards', description: 'Editar tableros' },
  { name: 'Eliminar Tableros', slug: 'delete-boards', type: 'action', resource: 'boards', description: 'Eliminar tableros' },

  // Kanban - Columns
  { name: 'Crear Columnas', slug: 'create-columns', type: 'action', resource: 'columns', description: 'Crear columnas' },
  { name: 'Editar Columnas', slug: 'edit-columns', type: 'action', resource: 'columns', description: 'Editar columnas' },
  { name: 'Eliminar Columnas', slug: 'delete-columns', type: 'action', resource: 'columns', description: 'Eliminar columnas' },
  { name: 'Ordenar Columnas', slug: 'reorder-columns', type: 'action', resource: 'columns', description: 'Ordenar columnas' },

  // Kanban - Tasks
  { name: 'Crear Tareas', slug: 'create-tasks', type: 'action', resource: 'tasks', description: 'Crear tareas' },
  { name: 'Editar Tareas', slug: 'edit-tasks', type: 'action', resource: 'tasks', description: 'Editar tareas' },
  { name: 'Eliminar Tareas', slug: 'delete-tasks', type: 'action', resource: 'tasks', description: 'Eliminar tareas' },
  { name: 'Mover Tareas', slug: 'move-tasks', type: 'action', resource: 'tasks', description: 'Mover tareas' },
  { name: 'Asignar Tareas', slug: 'assign-tasks', type: 'action', resource: 'tasks', description: 'Asignar tareas' },
  
  // Acciones de Roles
  { name: 'Crear Roles', slug: 'create-roles', type: 'action', resource: 'roles', description: 'Crear nuevos roles' },
  { name: 'Editar Roles', slug: 'edit-roles', type: 'action', resource: 'roles', description: 'Editar roles existentes' },
  { name: 'Eliminar Roles', slug: 'delete-roles', type: 'action', resource: 'roles', description: 'Eliminar roles' },
  { name: 'Asignar Permisos', slug: 'assign-permissions', type: 'action', resource: 'roles', description: 'Asignar permisos a roles' },
  
  // Acciones de Usuarios
  { name: 'Crear Usuarios', slug: 'create-users', type: 'action', resource: 'users', description: 'Crear nuevos usuarios' },
  { name: 'Editar Usuarios', slug: 'edit-users', type: 'action', resource: 'users', description: 'Editar usuarios existentes' },
  { name: 'Eliminar Usuarios', slug: 'delete-users', type: 'action', resource: 'users', description: 'Eliminar usuarios' },
  { name: 'Ver Todos los Usuarios', slug: 'view-all-users', type: 'action', resource: 'users', description: 'Ver todos los usuarios del sistema' },
  
  // Componentes
  { name: 'Botón Crear', slug: 'component-create-button', type: 'component', resource: 'create-button', description: 'Mostrar botón de crear' },
  { name: 'Botón Editar', slug: 'component-edit-button', type: 'component', resource: 'edit-button', description: 'Mostrar botón de editar' },
  { name: 'Botón Eliminar', slug: 'component-delete-button', type: 'component', resource: 'delete-button', description: 'Mostrar botón de eliminar' },
];

export async function seedPermissions() {
  for (const permission of permissionsSeed) {
    await Permission.findOrCreate({
      where: { slug: permission.slug },
      defaults: permission as any
    });
  }
}