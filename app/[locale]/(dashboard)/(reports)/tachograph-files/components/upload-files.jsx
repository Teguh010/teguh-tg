"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from 'react-i18next';
import { firstUpperLetter } from "@/lib/utils";

const UploadFiles = ({ handleUploadFilesChange }) => {
	const { t } = useTranslation();

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8"
				>{firstUpperLetter(t('upload_files'))}
				</Button>
			</DialogTrigger>
			<DialogContent size="2xl">
				<DialogHeader className="p-0">
					<DialogTitle className="text-base font-medium text-default-700 ">
						{firstUpperLetter(t('select_files'))}
					</DialogTitle>
				</DialogHeader>
				<div>
					<div className="h-auto">
						<ScrollArea className="h-full">
							<div className="grid gap-5">
								<div className="flex flex-col gap-2">
									<div className="p-1">
										<div
											className="border-2 border-dashed rounded-md p-5 text-center mb-2 bg-gray-100"
										>
											<p className="pb-2">
												{firstUpperLetter(t('drag_and_drop_your_files_here'))}
											</p>
											<Input
												size="xl"
												type="file"
												accept=".ddd"
												multiple
												placeholder="Files"
												onChange={handleUploadFilesChange}
											/>
										</div>
									</div>
								</div>
							</div>
						</ScrollArea>
					</div>

					<div className=" flex justify-center gap-3 mt-4">
						<DialogClose asChild>
							<Button type="button" variant="outline">{firstUpperLetter(t('close'))}</Button>
						</DialogClose>
						{/* 	<Button
							type="button"
							onClick={setUploadingFiles(() => true)}
							disabled={uploadingFiles}
						> {firstUpperLetter(t('send'))}</Button> */}
					</div>
				</div>
			</DialogContent>
		</Dialog >
	);
};

export default UploadFiles;