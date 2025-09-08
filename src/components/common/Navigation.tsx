import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Users, 
  ClipboardCheck, 
  MousePointerClick, 
  History, 
  UserPlus, 
  LogOut,
  GraduationCap,
  Menu,
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
  const [isOpen, setIsOpen] = useState(false);

  const NavigationContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">Academia System</h1>
        </div>
      </div>
      
      <nav className="flex flex-1 flex-col p-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-colors',
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
            <button className="group flex w-full gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-blue-600">
              <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-blue-600" />
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white shadow-xl">
          <NavigationContent />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <NavigationContent />
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Academia System</h1>
          </div>
        </div>
      </div>
    </>
  );
};