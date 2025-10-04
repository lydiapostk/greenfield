import { useEffect, useState } from "react";

import DropdownButton from "@/components/dropdown-button";
import EditableTextField from "@/components/input-field/editable-text-field";
import Icon from "@/components/icon/icon";
import SideDrawer from "@/components/side_drawer";

import { StartupReadType, WorkstreamReadType } from "@/data_display/data-type";
import { getUpdateWSFunction } from "@/data_display/utils";

import StartupTable from "@/startups/startup-table";
import StartupView from "@/startups/startup-view";
import StartupEditForm from "@/startups/startup-edit-form";
import ToggleViewEditButton from "@/app/(with-navbar)/components/toggle-view-edit-button";
import DeleteButton from "@/app/(with-navbar)/components/delete-button";
import WorkstreamSelectSupsModal from "./workstream-select-sups-modal";

interface WorkstreamEditFormProps<> {
    workstream: WorkstreamReadType;
    updateWorkstream: (workstream: WorkstreamReadType) => void;
    setIsLoading: (isOpen: boolean) => void;
}

export default function WorkstreamEditForm({
    workstream,
    updateWorkstream,
    setIsLoading,
}: WorkstreamEditFormProps) {
    const [error, setError] = useState<string>("");

    const [inFullScreen, setInFullScreen] = useState<boolean>(false);
    const [selectedStartup, setSelectedStartup] =
        useState<StartupReadType | null>(null);
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    const [selectedSupIDs, setSelectedSupIDs] = useState<number[]>([]);
    useEffect(() => {
        // Update startup if edits are made in side drawer
        if (!selectedStartup) return;
        // Update startups
        const updatedEvaluations = [...workstream.evaluations];
        const idxToUpdate = updatedEvaluations.findIndex((evaluation) => {
            return evaluation.startup.id == selectedStartup.id;
        });
        updatedEvaluations[idxToUpdate].startup = selectedStartup;
        const updatedWorkstream = {
            ...workstream,
            evaluations: updatedEvaluations,
        };
        updateWorkstream(updatedWorkstream);
    }, [selectedStartup]);

    // TODO: // Create Startup Modal
    // const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    // const router = useRouter();

    // Insert existing startups into WS Modal
    const [isInsertModalOpen, setIsInsertModalOpen] = useState<boolean>(false);
    const funcUpdateWS = getUpdateWSFunction({
        workstream_id: workstream.id,
        onSuccess: updateWorkstream,
        setError: setError,
    });

    const startupSidedrawerToolbar = (hasFullscreenToggle = false) => (
        <div className="flex flex-row w-full justify-between items-center mt-10">
            <div className="flex flex-row w-full justify-start items-center gap-2">
                <ToggleViewEditButton
                    inEditMode={inEditMode}
                    setInEditMode={setInEditMode}
                />
                {/* {deleteButtonComponent()} */}
            </div>
            {/* Enter full screen */}
            {hasFullscreenToggle && (
                <div
                    className={`inline-flex w-fit rounded-2xl px-3 py-1.5 mb-6 self-end 
                                stroke-2 gap-1 transition ease-in cursor-pointer hover:bg-stone-300`}
                    onClick={() => setInFullScreen(!inFullScreen)}
                >
                    <Icon
                        name={
                            inFullScreen
                                ? "arrowsPointingIn"
                                : "arrowsPointingOut"
                        }
                        size="md"
                        className="stroke-stone-800 hover:stroke-[2]"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col justify-start items-start mt-6 gap-4 w-full space-y-8 min-h-fit overflow-auto">
            {error && error !== "" && (
                <div className="flex flex-row items-center justify-start gap-2 font-mono italic text-red-700">
                    <Icon
                        name={"error"}
                        className=""
                        strokeWidth={2}
                        size="sm"
                    />
                    {error}
                </div>
            )}
            {/* Insert existing start-ups to workstream */}
            {isInsertModalOpen && workstream && (
                <WorkstreamSelectSupsModal
                    workstream={workstream}
                    setIsLoading={setIsLoading}
                    setIsModalOpen={setIsInsertModalOpen}
                    onSuccess={(ws: WorkstreamReadType) => {
                        updateWorkstream(ws);
                        setIsInsertModalOpen(false);
                    }}
                />
            )}
            <div className="flex flex-col justify-start w-full gap-2">
                <EditableTextField
                    label="Title:"
                    field_key="title"
                    value={workstream.title}
                    onSave={funcUpdateWS}
                    fontStyle="text-3xl font-bold"
                    showLabel={false}
                />
                <EditableTextField
                    label="Use Case:"
                    field_key="use_case"
                    value={workstream.use_case ? workstream.use_case : ""}
                    onSave={funcUpdateWS}
                    multiline={true}
                    textAreaSize={"sm"}
                />
                <EditableTextField
                    label="Challenge:"
                    field_key="challenge"
                    value={workstream.challenge ? workstream.challenge : ""}
                    onSave={funcUpdateWS}
                    multiline={true}
                    textAreaSize={"sm"}
                />
            </div>

            <div className="flex flex-col justify-start w-full gap-1">
                <span className="font-bold min-w-fit">Start-ups</span>
                <div className="flex flex-row justify-start items-center py-2 gap-2">
                    <DropdownButton
                        options={[
                            {
                                label: "New",
                                onClick: () => {
                                    // setIsCreateModalOpen(true); TODO: Implement
                                },
                            },
                            {
                                label: "Existing",
                                onClick: () => {
                                    setIsInsertModalOpen(true);
                                },
                            },
                        ]}
                        text={`Add start-ups`}
                        showText={true}
                    />
                    {/* TODO: Implement delete */}
                    {/* <DeleteButton
                        onClick={() => setIsDelModalOpen(true)}
                        showText={true}
                        deleteText={`Delete (${selectedIds.length})`}
                        disabled={selectedIds.length == 0 || !!selectedStartup}
                    /> */}
                </div>
                <StartupTable
                    startups={workstream.evaluations.map(
                        (evaluation) => evaluation.startup
                    )}
                    onClickStartup={setSelectedStartup}
                    selectedIds={selectedSupIDs}
                    setSelectedIds={setSelectedSupIDs}
                />
                {selectedStartup && (
                    <SideDrawer
                        onClose={() => {
                            setSelectedStartup(null);
                            setInFullScreen(false);
                            setInEditMode(false);
                        }}
                        inFullScreen={inFullScreen}
                    >
                        {/* Sidebar tools */}

                        {/* Choice of displaying edit or view mode*/}
                        {inEditMode ? (
                            <StartupEditForm
                                startup={selectedStartup}
                                setStartup={setSelectedStartup}
                                topToolbar={startupSidedrawerToolbar(true)}
                                bottomToolbar={startupSidedrawerToolbar(false)}
                            />
                        ) : (
                            <StartupView
                                startup={selectedStartup}
                                topToolbar={startupSidedrawerToolbar(true)}
                                bottomToolbar={startupSidedrawerToolbar(false)}
                            />
                        )}
                    </SideDrawer>
                )}
            </div>
        </div>
    );
}
