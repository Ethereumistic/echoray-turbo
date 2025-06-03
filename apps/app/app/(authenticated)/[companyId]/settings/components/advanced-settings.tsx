'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Alert, AlertDescription } from '@repo/design-system/components/ui/alert';
import { Separator } from '@repo/design-system/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/components/ui/alert-dialog';
import {
  DatabaseIcon,
  DownloadIcon,
  AlertTriangleIcon,
  Trash2Icon,
  UserXIcon,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface AdvancedSettingsProps {
  company: Company;
}

export const AdvancedSettings = ({ company }: AdvancedSettingsProps) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDataExport = () => {
    // Implement data export functionality
    console.log('Exporting company data...');
  };

  const handleDeleteCompany = async () => {
    if (confirmationText !== company.name) {
      return;
    }

    setIsDeleting(true);
    try {
      // Implement company deletion
      console.log('Deleting company...');
    } catch (error) {
      console.error('Error deleting company:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DatabaseIcon className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Export or manage your company data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Company Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a complete export of your company data
              </p>
            </div>
            <Button variant="outline" onClick={handleDataExport}>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Ownership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserXIcon className="h-5 w-5" />
            <span>Transfer Ownership</span>
          </CardTitle>
          <CardDescription>
            Transfer company ownership to another member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              Transferring ownership will give another user full control over this company.
              This action cannot be undone.
            </AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" disabled>
            Transfer Ownership
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangleIcon className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>
              These actions are permanent and cannot be undone. Please proceed with extreme caution.
            </AlertDescription>
          </Alert>

          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400">Delete Company</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this company and all associated data. This action cannot be undone.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Company
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This action cannot be undone. This will permanently delete the{' '}
                      <strong>{company.name}</strong> company and remove all data from our servers.
                    </p>
                    <p>This includes:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>All members and their access</li>
                      <li>All departments and organizational structure</li>
                      <li>All company settings and preferences</li>
                      <li>All historical data and analytics</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="confirmation">
                      Type <strong>{company.name}</strong> to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={company.name}
                      className="mt-2"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmationText('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCompany}
                    disabled={confirmationText !== company.name || isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Company'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 