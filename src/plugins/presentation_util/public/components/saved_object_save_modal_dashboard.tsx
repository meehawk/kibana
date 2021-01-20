/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */

import React, { useState } from 'react';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiRadio,
  EuiIconTip,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import { SavedObjectsClientContract } from '../../../../core/public';

import {
  OnSaveProps,
  SaveModalState,
  SavedObjectSaveModal,
} from '../../../../plugins/saved_objects/public';

import { DashboardPicker } from './dashboard_picker';

import './saved_object_save_modal_dashboard.scss';

interface SaveModalDocumentInfo {
  id?: string;
  title: string;
  description?: string;
}

export interface DashboardSaveModalProps {
  documentInfo: SaveModalDocumentInfo;
  objectType: string;
  onClose: () => void;
  onSave: (props: OnSaveProps & { dashboardId: string | null }) => void;
  savedObjectsClient: SavedObjectsClientContract;
  tagOptions?: React.ReactNode | ((state: SaveModalState) => React.ReactNode);
}

export function SavedObjectSaveModalDashboard(props: DashboardSaveModalProps) {
  const { documentInfo, savedObjectsClient, tagOptions } = props;
  const initialCopyOnSave = !Boolean(documentInfo.id);

  const [dashboardOption, setDashboardOption] = useState<'new' | 'existing' | null>(
    documentInfo.id ? null : 'existing'
  );
  const [selectedDashboard, setSelectedDashboard] = useState<{ id: string; name: string } | null>(
    null
  );
  const [copyOnSave, setCopyOnSave] = useState<boolean>(initialCopyOnSave);

  const renderDashboardSelect = (state: SaveModalState) => {
    const isDisabled = Boolean(!state.copyOnSave && documentInfo.id);

    return (
      <>
        <EuiFormRow
          label={
            <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
              <EuiFlexItem grow={false}>
                <FormattedMessage
                  id="presentationUtil.saveModalDashboard.addToDashboardLabel"
                  defaultMessage="Add to dashboard"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiIconTip
                  type="iInCircle"
                  content={
                    <FormattedMessage
                      id="presentationUtil.saveModalDashboard.dashboardInfoTooltip"
                      defaultMessage="Items added to a dashboard will not appear in the library and must be edited from the dashboard."
                    />
                  }
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          }
          hasChildLabel={false}
        >
          <EuiPanel color="subdued" hasShadow={false}>
            <div>
              <EuiRadio
                checked={dashboardOption === 'existing'}
                id="existing"
                name="dashboard-option"
                label={i18n.translate(
                  'presentationUtil.saveModalDashboard.existingDashboardOptionLabel',
                  {
                    defaultMessage: 'Existing',
                  }
                )}
                onChange={() => setDashboardOption('existing')}
                disabled={isDisabled}
              />

              <div className="savAddDashboard__searchDashboards">
                <DashboardPicker
                  savedObjectsClient={savedObjectsClient}
                  isDisabled={dashboardOption !== 'existing'}
                  onChange={(dash) => {
                    setSelectedDashboard(dash);
                  }}
                />
              </div>

              <EuiSpacer size="s" />

              <EuiRadio
                checked={dashboardOption === 'new'}
                id="new"
                name="dashboard-option"
                label={i18n.translate(
                  'presentationUtil.saveModalDashboard.newDashboardOptionLabel',
                  {
                    defaultMessage: 'New',
                  }
                )}
                onChange={() => setDashboardOption('new')}
                disabled={isDisabled}
              />

              <EuiSpacer size="s" />

              <EuiRadio
                checked={dashboardOption === null}
                id="library"
                name="dashboard-option"
                label={i18n.translate('presentationUtil.saveModalDashboard.libraryOptionLabel', {
                  defaultMessage: 'No dashboard, but add to library',
                })}
                onChange={() => setDashboardOption(null)}
                disabled={isDisabled}
              />
            </div>
          </EuiPanel>
        </EuiFormRow>
      </>
    );
  };

  const onCopyOnSaveChange = (newCopyOnSave: boolean) => {
    setDashboardOption(null);
    setCopyOnSave(newCopyOnSave);
  };

  const onModalSave = (onSaveProps: OnSaveProps) => {
    let dashboardId = null;

    // Don't save with a dashboard ID if we're
    // just updating an existing visualization
    if (!(!onSaveProps.newCopyOnSave && documentInfo.id)) {
      if (dashboardOption === 'existing') {
        dashboardId = selectedDashboard?.id || null;
      } else {
        dashboardId = dashboardOption;
      }
    }

    props.onSave({ ...onSaveProps, dashboardId });
  };

  const saveLibraryLabel =
    !copyOnSave && documentInfo.id
      ? i18n.translate('presentationUtil.saveModalDashboard.saveLabel', {
          defaultMessage: 'Save',
        })
      : i18n.translate('presentationUtil.saveModalDashboard.saveToLibraryLabel', {
          defaultMessage: 'Save and add to library',
        });
  const saveDashboardLabel = i18n.translate(
    'presentationUtil.saveModalDashboard.saveAndGoToDashboardLabel',
    {
      defaultMessage: 'Save and go to Dashboard',
    }
  );

  const confirmButtonLabel = dashboardOption === null ? saveLibraryLabel : saveDashboardLabel;

  const isValid = !(dashboardOption === 'existing' && selectedDashboard === null);

  return (
    <SavedObjectSaveModal
      onSave={onModalSave}
      onClose={props.onClose}
      title={documentInfo.title}
      showCopyOnSave={documentInfo.id ? true : false}
      initialCopyOnSave={initialCopyOnSave}
      confirmButtonLabel={confirmButtonLabel}
      objectType={props.objectType}
      options={dashboardOption === null ? tagOptions : undefined} // Show tags when not adding to dashboard
      rightOptions={renderDashboardSelect}
      description={documentInfo.description}
      showDescription={true}
      isValid={isValid}
      onCopyOnSaveChange={onCopyOnSaveChange}
    />
  );
}
