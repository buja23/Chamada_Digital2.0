import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  ClipboardCheck, 
  MousePointerClick, 
  History, 
  UserPlus, 
  LogOut,
  GraduationCap
} from 'lucide-react';

const navigation = [
  { name: 'Alunos', href: '/students', icon: Users },
  { name: 'Chamada', href: '/attendance', icon: ClipboardCheck },
  { name: 'Chamada Interativa', href: '/interactive-attendance', icon: MousePointerClick },
  { name: 'Histórico', href: '/history', icon: History },
  { name: 'Cadastrar Aluno', href: '/register', icon: UserPlus },
];

export const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Academia System</h1>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li className="mt-auto">
              <button className="group -mx-2 flex w-full gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-600" />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};