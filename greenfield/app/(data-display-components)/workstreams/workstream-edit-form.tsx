import { Dispatch, SetStateAction, useEffect, useState } from "react";

import EditableTextField from "@/components/input-field/editable-text-field";
import Icon from "@/components/icon/icon";
import SideDrawer from "@/components/side_drawer";

import {
    EvaluationReadType,
    StartupReadType,
    SuggestionFromUseCaseType,
    WorkstreamPropertyTypes,
    WorkstreamReadType,
} from "@/data_display/data-type";
import {
    deleteFromDB,
    fetchSuggestionFromUseCase,
    getUpdateEvaluationFunction,
    getUpdateWSFunction,
} from "@/data_display/utils";

import StartupTable from "@/startups/startup-table";
import StartupView from "@/startups/startup-view";
import StartupEditForm from "@/startups/startup-edit-form";
import ToggleViewEditButton from "@/app/(with-navbar)/components/toggle-view-edit-button";
import DeleteButton from "@/app/(with-navbar)/components/delete-button";
import WorkstreamSelectSupsModal from "./workstream-select-sups-modal";
import ConfirmModal from "@/components/confirm-modal";
import EditableListField from "@/components/input-field/editable-list-field";
import IconButton from "@/components/icon-button";
import SuggestionField from "@/app/components/suggestion-field";
import { colourCSS } from "@/components/style";

interface WorkstreamEditFormProps<> {
    workstream: WorkstreamReadType;
    updateWorkstream: Dispatch<SetStateAction<WorkstreamReadType | null>>;
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

    // Delete Startup Modal
    const [isDelModalOpen, setIsDelModalOpen] = useState<boolean>(false);
    const [delError, setDelError] = useState<string>("");
    const onRemoveStartupsFromWS = (startupIDsToDel: number[]) => {
        deleteFromDB({
            type: ["evaluations", workstream.id],
            idsToDel: startupIDsToDel,
            setIsLoading: setIsLoading,
            setIsDelModalOpen: setIsDelModalOpen,
            setError: setDelError,
            onSuccess: () => {
                const updatedWorkstream = {
                    ...workstream,
                    evaluations: [...workstream.evaluations].filter(
                        (evaluation) =>
                            !startupIDsToDel.includes(evaluation.startup.id)
                    ),
                };
                updateWorkstream(updatedWorkstream);
                setSelectedSupIDs([]);
                setSelectedStartup(null);
            },
        });
    };

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

    // Get suggestion for use case / challenge / technology areas
    const [suggestion, setSuggestion] =
        useState<SuggestionFromUseCaseType | null>(null);
    const [suggestionError, setSuggestionError] = useState<string>("");
    const [isSuggestionLoading, setIsSuggestionLoading] =
        useState<boolean>(false);
    function fetchSuggestion(): void {
        if (!workstream.use_case) {
            setSuggestionError("Use case must not be empty!");
            return;
        }
        fetchSuggestionFromUseCase({
            useCase: workstream.use_case,
            setIsLoading: setIsSuggestionLoading,
            setError: setSuggestionError,
            onSuccess: setSuggestion,
        });
    }
    const _clearFromSuggestion = (field: keyof SuggestionFromUseCaseType) => {
        const updatedSuggestion = { ...suggestion };
        delete updatedSuggestion[field];
        setTimeout(() => {
            setSuggestion(updatedSuggestion);
        }, 200); // Give time to close
    };
    const funcUpdateWSFromSuggestion = (
        field: keyof SuggestionFromUseCaseType,
        value: WorkstreamPropertyTypes
    ) => {
        if (!suggestion) return;
        getUpdateWSFunction({
            workstream_id: workstream.id,
            onSuccess: (ws) => {
                updateWorkstream(ws);
                _clearFromSuggestion(field);
            },
            setError: setSuggestionError,
        })(field, value);
    };

    const startupSidedrawerToolbar = (hasFullscreenToggle = false) => (
        <div className="flex flex-row w-full justify-between items-center mt-10">
            <div className="flex flex-row w-full justify-start items-center gap-2">
                <ToggleViewEditButton
                    inEditMode={inEditMode}
                    setInEditMode={setInEditMode}
                />
                <DeleteButton
                    onClick={() => setIsDelModalOpen(true)}
                    showText={true}
                    deleteText={"Remove"}
                />
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
        <div className="flex flex-col justify-start items-start mt-6 gap-4 w-full space-y-8 min-h-fit">
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

            {/* Delete Modal */}
            {isDelModalOpen && (
                <ConfirmModal
                    message="This action will also permanently remove all evaluations for these start-ups in this workstream."
                    confirmText={`Remove (${
                        selectedStartup ? 1 : selectedSupIDs.length
                    })`}
                    onClose={() => {
                        setIsDelModalOpen(false);
                        setDelError("");
                    }}
                    onConfirm={() =>
                        selectedStartup
                            ? onRemoveStartupsFromWS([selectedStartup.id])
                            : onRemoveStartupsFromWS(selectedSupIDs)
                    }
                    error={delError}
                />
            )}
            <div className="flex flex-col justify-start w-full gap-2">
                <EditableTextField
                    label="Title:"
                    field_key="title"
                    value={workstream.title}
                    onSave={funcUpdateWS}
                    valueStyle="text-3xl font-bold"
                    showLabel={false}
                />
                <span className="text-gray-500 font-medium italic text-sm">
                    {`Created: ${workstream.create_date}`}
                </span>
                {workstream.use_case && workstream.use_case != "" && (
                    <IconButton
                        onClick={() => fetchSuggestion()}
                        text={`${
                            isSuggestionLoading ? "Getting" : "Get"
                        } suggestions from use case`}
                        className={`${colourCSS["pop"]} mb-6`}
                        iconName={isSuggestionLoading ? "spinner" : "lightBulb"}
                        iconClassName={
                            isSuggestionLoading
                                ? "text-stone-200 fill-sky-400"
                                : undefined
                        }
                        showText={true}
                        disabled={
                            !workstream.use_case || workstream.use_case == ""
                        }
                    />
                )}
                {suggestionError !== "" && (
                    <div className="flex flex-row items-center justify-start gap-2 font-mono italic text-red-700">
                        <Icon
                            name={"error"}
                            className=""
                            strokeWidth={2}
                            size="sm"
                        />
                        {suggestionError}
                    </div>
                )}

                <EditableTextField
                    label="Use Case:"
                    field_key="use_case"
                    value={workstream.use_case ? workstream.use_case : ""}
                    onSave={funcUpdateWS}
                    multiline={true}
                    textAreaSize={"sm"}
                />
                {suggestion?.use_case && (
                    <SuggestionField
                        suggestion={suggestion.use_case}
                        onApply={() => {
                            funcUpdateWSFromSuggestion(
                                "use_case",
                                suggestion.use_case
                            );
                        }}
                        onCancel={() => _clearFromSuggestion("use_case")}
                    />
                )}
                <EditableTextField
                    label="Challenge:"
                    field_key="challenge"
                    value={workstream.challenge ? workstream.challenge : ""}
                    onSave={funcUpdateWS}
                    multiline={true}
                    textAreaSize={"sm"}
                />
                {suggestion?.challenge && (
                    <SuggestionField
                        suggestion={suggestion.challenge}
                        onApply={() => {
                            funcUpdateWSFromSuggestion(
                                "challenge",
                                suggestion.challenge
                            );
                        }}
                        onCancel={() => _clearFromSuggestion("challenge")}
                    />
                )}
                <EditableListField
                    key={JSON.stringify(workstream.technologies)}
                    label="Technologies:"
                    field_key="technologies"
                    value={
                        workstream.technologies ? workstream.technologies : []
                    }
                    onSave={funcUpdateWS}
                />
                {suggestion?.technologies && (
                    <SuggestionField
                        suggestion={suggestion.technologies}
                        onApply={() => {
                            funcUpdateWSFromSuggestion(
                                "technologies",
                                suggestion.technologies
                            );
                        }}
                        onCancel={() => _clearFromSuggestion("technologies")}
                    />
                )}
            </div>

            <div className="flex flex-col justify-start w-full gap-1">
                <span className="font-bold min-w-fit">Start-ups</span>
                <div className="flex flex-row justify-start items-center py-2 gap-2">
                    <div
                        onClick={() => {
                            setIsInsertModalOpen(true);
                        }}
                        className=" inline-flex px-3 py-1.5 mb-6 w-fit p-2 stroke-2 gap-1 
                                    transition ease-in rounded-2xl cursor-pointer font-medium 
                                    bg-indigo-300 hover:bg-indigo-200 text-indigo-800"
                    >
                        <Icon
                            name={"add"}
                            size="md"
                            className="stroke-indigo-800 hover:stroke-[2]"
                        />
                        Add start-ups
                    </div>
                    <DeleteButton
                        onClick={() => setIsDelModalOpen(true)}
                        showText={true}
                        deleteText={`Remove (${selectedSupIDs.length})`}
                        disabled={
                            selectedSupIDs.length == 0 || !!selectedStartup
                        }
                    />
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
                <div className="flex flex-col gap-6">
                    {workstream.evaluations.map((evaluation, idx) => {
                        const onConfirm = getUpdateEvaluationFunction({
                            workstream_id: workstream.id,
                            startup_id: evaluation.startup.id,
                            onSuccess: (evaluation: EvaluationReadType) => {
                                const updatedEvaluations = [
                                    ...workstream.evaluations,
                                ];
                                updatedEvaluations[idx] = evaluation;
                                const updatedWorkstream = {
                                    ...workstream,
                                    evaluations: updatedEvaluations,
                                };
                                updateWorkstream(updatedWorkstream);
                            },
                            setError: setError,
                        });
                        return (
                            <div
                                key={evaluation.startup.id}
                                className="w-full flex flex-col gap-4"
                            >
                                <div className="font-bold text-md text-slate-800 border-b py-2">
                                    {evaluation.startup.company_name}
                                </div>
                                <EditableTextField
                                    onSave={onConfirm}
                                    label={"Competitive advantage:"}
                                    field_key={"competitive_advantage"}
                                    value={
                                        evaluation.competitive_advantage
                                            ? evaluation.competitive_advantage
                                            : ""
                                    }
                                    multiline={true}
                                    textAreaSize={"sm"}
                                />
                                <EditableTextField
                                    onSave={onConfirm}
                                    label={"Risks:"}
                                    field_key={"risks"}
                                    value={
                                        evaluation.risks ? evaluation.risks : ""
                                    }
                                    multiline={true}
                                    textAreaSize={"sm"}
                                />
                                <EditableTextField
                                    onSave={onConfirm}
                                    label={"Collaboration potential:"}
                                    field_key={"collaboration_potential"}
                                    value={
                                        evaluation.collaboration_potential
                                            ? evaluation.collaboration_potential
                                            : ""
                                    }
                                    multiline={true}
                                    textAreaSize={"sm"}
                                />
                            </div>
                        );
                    })}
                    <div className="w-full">
                        <EditableTextField
                            onSave={funcUpdateWS}
                            label={"Conclusion"}
                            labelStyle="text-2xl text-semibold mt-6 border-b"
                            field_key={"overall_recommendation"}
                            value={
                                workstream.overall_recommendation
                                    ? workstream.overall_recommendation
                                    : ""
                            }
                            multiline={true}
                            textAreaSize={"sm"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
