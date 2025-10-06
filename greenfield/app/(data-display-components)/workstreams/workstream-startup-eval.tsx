import EditableTextField from "@/components/input-field/editable-text-field";
import { useState } from "react";
import {
    EvaluationReadType,
    SuggestionForStartupEvaluationType,
    WorkstreamReadType,
} from "../data-type";
import {
    fetchSupEvalSuggestionFromWS,
    getUpdateEvaluationFunction,
} from "../utils";
import IconButton from "@/components/icon-button";
import Icon from "@/components/icon/icon";
import { colourCSS } from "@/components/style";
import SuggestionField from "./suggestion-field";

interface WorkstreamStartupEvaluationProps {
    workstream: WorkstreamReadType;
    evaluationIdx: number;
    evaluation: EvaluationReadType;
    updateWorkstream: React.Dispatch<
        React.SetStateAction<WorkstreamReadType | null>
    >;
}

export default function WorkstreamStartupEvaluation({
    workstream,
    evaluationIdx,
    evaluation,
    updateWorkstream,
}: WorkstreamStartupEvaluationProps) {
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const onConfirm = getUpdateEvaluationFunction({
        workstream_id: workstream.id,
        startup_id: evaluation.startup.id,
        onSuccess: (evaluation: EvaluationReadType) => {
            const updatedEvaluations = [...workstream.evaluations];
            updatedEvaluations[evaluationIdx] = evaluation;
            const updatedWorkstream = {
                ...workstream,
                evaluations: updatedEvaluations,
            };
            updateWorkstream(updatedWorkstream);
        },
        setError: setError,
    });
    const [suggestion, setSuggestion] =
        useState<SuggestionForStartupEvaluationType | null>(null);
    function fetchSuggestion() {
        fetchSupEvalSuggestionFromWS({
            companyName: evaluation.startup.company_name!,
            workstream: workstream,
            setIsLoading: setIsLoading,
            onSuccess: setSuggestion,
        });
    }
    const _clearFromSuggestion = (
        field: keyof SuggestionForStartupEvaluationType
    ) => {
        const updatedSuggestion = { ...suggestion };
        delete updatedSuggestion[field];
        setTimeout(() => {
            setSuggestion(updatedSuggestion);
        }, 200); // Give time to close
    };
    return (
        <div key={evaluation.startup.id} className="w-full flex flex-col gap-4">
            <div className="font-bold text-md text-slate-800 border-b py-2">
                {evaluation.startup.company_name}
            </div>
            {workstream.use_case && workstream.use_case != "" && (
                <IconButton
                    onClick={() => fetchSuggestion()}
                    text={`${
                        isLoading ? "Generating" : "Generate"
                    } suggestions`}
                    className={`text-white bg-fuchsia-800/65 hover:bg-fuchsia-800/85 mb-6`}
                    iconName={isLoading ? "spinner" : "lightBulb"}
                    iconClassName={
                        isLoading ? "text-stone-200 fill-sky-400" : undefined
                    }
                    showText={true}
                    disabled={!workstream.use_case || workstream.use_case == ""}
                />
            )}
            {error !== "" && (
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
            {suggestion?.competitive_advantage && (
                <SuggestionField
                    suggestion={suggestion.competitive_advantage}
                    onApply={() => {
                        onConfirm(
                            "competitive_advantage",
                            suggestion.competitive_advantage!,
                            () => {}
                        );
                        _clearFromSuggestion("competitive_advantage");
                    }}
                    onCancel={() =>
                        _clearFromSuggestion("competitive_advantage")
                    }
                />
            )}
            <EditableTextField
                onSave={onConfirm}
                label={"Risks:"}
                field_key={"risks"}
                value={evaluation.risks ? evaluation.risks : ""}
                multiline={true}
                textAreaSize={"sm"}
            />
            {suggestion?.risks && (
                <SuggestionField
                    suggestion={suggestion.risks}
                    onApply={() => {
                        onConfirm("risks", suggestion.risks!, () => {});
                        _clearFromSuggestion("risks");
                    }}
                    onCancel={() => _clearFromSuggestion("risks")}
                />
            )}
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
            {suggestion?.collaboration_potential && (
                <SuggestionField
                    suggestion={suggestion.collaboration_potential}
                    onApply={() => {
                        onConfirm(
                            "collaboration_potential",
                            suggestion.collaboration_potential!,
                            () => {}
                        );
                        _clearFromSuggestion("collaboration_potential");
                    }}
                    onCancel={() =>
                        _clearFromSuggestion("collaboration_potential")
                    }
                />
            )}
        </div>
    );
}
