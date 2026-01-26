import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentCard } from '@/components/students/StudentCard';
import { StudentForm } from '@/components/students/StudentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Importando abas
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/types';
import { Plus, Search, Users, Sun, Sunset, Moon, ClipboardList, LayoutGrid } from 'lucide-react';

export const Students: React.FC = () => {
  const { data: students = [], isLoading } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Estado para controlar a aba ativa (Padrão: 'all' para ver todos)
  const [activeTab, setActiveTab] = useState('all');

  const filteredStudents = students.filter(student => {
    // 1. Filtro de Texto (Nome ou Faixa)
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.belt.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filtro de Categoria (Abas)
    // Se a aba for 'all', aceita tudo.
    // Se não, verifica se a categoria bate. Se o aluno não tiver categoria, assume 'regular' (Noite).
    const studentCategory = student.category || 'regular';
    const matchesCategory = activeTab === 'all' 
      ? true 
      : studentCategory === activeTab;

    return matchesSearch && matchesCategory;
  });

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Alunos</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredStudents.length} alunos encontrados
              {activeTab !== 'all' && <span className="text-xs ml-1 opacity-70">(filtrado)</span>}
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStudent(null)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
              </DialogTitle>
            </DialogHeader>
            <StudentForm
              student={editingStudent}
              onSuccess={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* ABAS DE FILTRO POR TURMA */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
          <TabsTrigger value="all" className="py-2">
            <LayoutGrid className="w-4 h-4 mr-2" /> Todos
          </TabsTrigger>
          <TabsTrigger value="morning" className="py-2">
            <Sun className="w-4 h-4 mr-2 text-orange-500" /> Manhã
          </TabsTrigger>
          <TabsTrigger value="afternoon" className="py-2">
            <Sunset className="w-4 h-4 mr-2 text-blue-400" /> Tarde
          </TabsTrigger>
          <TabsTrigger value="regular" className="py-2">
            <Moon className="w-4 h-4 mr-2 text-indigo-600" /> Noite
          </TabsTrigger>
          <TabsTrigger value="trial" className="py-2">
            <ClipboardList className="w-4 h-4 mr-2 text-yellow-600" /> Em Teste
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou faixa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum aluno encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca.'
              : 'Não há alunos nesta categoria.'
            }
          </p>
          {!searchTerm && activeTab === 'all' && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Aluno
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleEditStudent}
            />
          ))}
        </div>
      )}
    </div>
  );
};