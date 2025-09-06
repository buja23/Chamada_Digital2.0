import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types';

interface StudentCheckboxProps {
  student: Student;
  isPresent: boolean;
  onChange: (isPresent: boolean) => void;
}

const getBeltColor = (belt: string) => {
  const colors: Record<string, string> = {
    'branca': 'bg-gray-100 text-gray-800',
    'amarela': 'bg-yellow-100 text-yellow-800',
    'laranja': 'bg-orange-100 text-orange-800',
    'verde': 'bg-green-100 text-green-800',
    'azul': 'bg-blue-100 text-blue-800',
    'marrom': 'bg-amber-100 text-amber-800',
    'preta': 'bg-gray-800 text-white',
  };
  return colors[belt.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export const StudentCheckbox: React.FC<StudentCheckboxProps> = ({
  student,
  isPresent,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
      <Checkbox
        id={student.id}
        checked={isPresent}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      
      <div className="flex-1">
        <label
          htmlFor={student.id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {student.name}
        </label>
      </div>
      
      <Badge className={getBeltColor(student.belt)}>
        {student.belt}
      </Badge>
      
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        isPresent 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isPresent ? 'Presente' : 'Ausente'}
      </div>
    </div>
  );
};