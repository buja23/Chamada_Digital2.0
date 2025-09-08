import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentForm } from '@/components/students/StudentForm';
import { UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <UserPlus className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Novo Aluno</h1>
          <p className="text-gray-600 dark:text-gray-400">Adicione um novo aluno ao sistema</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Aluno</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};